CREATE TABLE `creatures` (
	`id` varchar(48) NOT NULL,
	`creatorId` int NOT NULL,
	`name` varchar(64) NOT NULL,
	`family` varchar(32) NOT NULL,
	`generatorVersion` varchar(24) NOT NULL,
	`seed` varchar(24) NOT NULL,
	`dna` text NOT NULL,
	`genomeJson` text NOT NULL,
	`scoreJson` text NOT NULL,
	`rarity` enum('common','uncommon','rare','extreme','anomalous','singular') NOT NULL,
	`rarityReason` text NOT NULL,
	`parentIdsJson` text NOT NULL,
	`generation` int NOT NULL DEFAULT 0,
	`previewKey` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `creatures_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `field_trials` (
	`id` varchar(64) NOT NULL,
	`trialDate` varchar(10) NOT NULL,
	`title` varchar(120) NOT NULL,
	`constraintType` varchar(32) NOT NULL,
	`constraintJson` text NOT NULL,
	`baseSeed` varchar(24) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `field_trials_id` PRIMARY KEY(`id`),
	CONSTRAINT `field_trials_trialDate_unique` UNIQUE(`trialDate`)
);
--> statement-breakpoint
CREATE TABLE `player_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`handle` varchar(40) NOT NULL,
	`xp` int NOT NULL DEFAULT 0,
	`level` int NOT NULL DEFAULT 1,
	`discoveriesJson` text NOT NULL,
	`specialty` varchar(64) NOT NULL DEFAULT 'Field Walker',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `player_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `player_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `trial_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trialId` varchar(64) NOT NULL,
	`creatureId` varchar(48) NOT NULL,
	`creatorId` int NOT NULL,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `trial_submissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `trial_submission_creature_unique` UNIQUE(`trialId`,`creatureId`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
ALTER TABLE `creatures` ADD CONSTRAINT `creatures_creatorId_users_id_fk` FOREIGN KEY (`creatorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `player_profiles` ADD CONSTRAINT `player_profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trial_submissions` ADD CONSTRAINT `trial_submissions_trialId_field_trials_id_fk` FOREIGN KEY (`trialId`) REFERENCES `field_trials`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trial_submissions` ADD CONSTRAINT `trial_submissions_creatureId_creatures_id_fk` FOREIGN KEY (`creatureId`) REFERENCES `creatures`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trial_submissions` ADD CONSTRAINT `trial_submissions_creatorId_users_id_fk` FOREIGN KEY (`creatorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `creatures_creator_idx` ON `creatures` (`creatorId`);--> statement-breakpoint
CREATE INDEX `creatures_family_idx` ON `creatures` (`family`);--> statement-breakpoint
CREATE INDEX `field_trials_date_idx` ON `field_trials` (`trialDate`);--> statement-breakpoint
CREATE INDEX `player_profiles_user_idx` ON `player_profiles` (`userId`);--> statement-breakpoint
CREATE INDEX `trial_submission_creator_idx` ON `trial_submissions` (`creatorId`);