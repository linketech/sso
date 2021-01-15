CREATE TABLE `user` (
  `id` binary(16) NOT NULL,
  `name` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hash_password` binary(32) NOT NULL,
  `salt` binary(16) NOT NULL,
  `frontend_salt` binary(16) NOT NULL,
  `create_time` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
