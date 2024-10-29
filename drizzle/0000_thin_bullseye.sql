CREATE TABLE `auth_session` (
	`key` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `auth_state` (
	`key` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `bookmark` (
	`id` text PRIMARY KEY NOT NULL,
	`uri` text,
	`author_did` text NOT NULL,
	`link` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `auth_session_key_unique` ON `auth_session` (`key`);--> statement-breakpoint
CREATE UNIQUE INDEX `auth_state_key_unique` ON `auth_state` (`key`);--> statement-breakpoint
CREATE UNIQUE INDEX `bookmark_id_unique` ON `bookmark` (`id`);