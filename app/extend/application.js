const knex = require('knex')

const POOL = Symbol('Application#POOL')

const times = { }
// Used for keeping track of the order queries are executed.
let count = 0

const printQueryWithTime = (uid, logger) => {
	const { startTime, endTime, query } = times[uid]
	const elapsedTime = endTime - startTime

	// I print the sql generated for a given query, as well as
	// the bindings for the queries.
	logger.info([
		`[${query.sql}]`,
		`[${query.bindings ? query.bindings.map((binding) => {
			if (binding instanceof Buffer) {
				return `0x${binding.toString('hex')}`
			}
			return binding
		}).join(',') : ''}]`,
		`[${elapsedTime.toFixed(3)} ms]`,
	].join(' '))

	// After I print out the query, I have no more use to it,
	// so I delete it from my map so it doesn't grow out of control.
	delete times[uid]
}

const printIfPossible = (uid, logger) => {
	const { position } = times[uid]

	// Look of a query with a position one less than the current query
	const previousTimeUid = Object.keys(times).find((key) => times[key].position === position - 1)

	// If we didn't find it, it must have been printed already and we can safely print ourselves.
	if (!previousTimeUid) {
		printQueryWithTime(uid, logger)
	}
}

const printQueriesAfterGivenPosition = (position) => {
	// Look for the next query in the queue
	const nextTimeUid = Object.keys(times).find((key) => times[key].position === position + 1)

	// If we find one and it is marked as finished, we can go ahead and print it
	if (nextTimeUid && times[nextTimeUid].finished) {
		const nextPosition = times[nextTimeUid].position
		printQueryWithTime(nextTimeUid)

		// There might be more queries that need to printed, so we should keep looking...
		printQueriesAfterGivenPosition(nextPosition)
	}
}

module.exports = {
	get knex() {
		if (!this[POOL]) {
			const knexClient = knex(this.config.knex.client)
			knexClient.on('query', (query) => {
				// eslint-disable-next-line no-underscore-dangle
				const uid = query.__knexQueryUid
				times[uid] = {
					position: count,
					query,
					startTime: Date.now(),
					// I keep track of when a query is finished with a boolean instead of
					// presence of an end time. It makes the logic easier to read.
					finished: false,
				}
				count += 1
			}).on('query-response', (response, query) => {
				// eslint-disable-next-line no-underscore-dangle
				const uid = query.__knexQueryUid
				times[uid].endTime = Date.now()
				times[uid].finished = true
				const { position } = times[uid]

				// Print the current query, if I'm able
				printIfPossible(uid, this.logger)

				// Check to see if queries further down the queue can be executed,
				// in case they weren't able to be printed when they first responded.
				printQueriesAfterGivenPosition(position)
			})
			this[POOL] = knexClient
		}
		return this[POOL]
	},
}
