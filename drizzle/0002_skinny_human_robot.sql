CREATE TABLE `draft_post` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`author_did` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `draft_post_id_unique` ON `draft_post` (`id`);