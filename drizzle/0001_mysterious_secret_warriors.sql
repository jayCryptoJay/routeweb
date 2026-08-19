CREATE TABLE `delivery_stops` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sequenceNumber` int NOT NULL,
	`address` varchar(255) NOT NULL,
	`municipality` varchar(128) NOT NULL,
	`roadLabel` varchar(160) NOT NULL,
	`status` enum('pending','completed','skipped') NOT NULL DEFAULT 'pending',
	`lat` double,
	`lng` double,
	`notes` text,
	`specialRequest` text,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `delivery_stops_id` PRIMARY KEY(`id`),
	CONSTRAINT `delivery_stops_sequenceNumber_unique` UNIQUE(`sequenceNumber`)
);
--> statement-breakpoint
CREATE INDEX `delivery_stops_status_idx` ON `delivery_stops` (`status`);--> statement-breakpoint
CREATE INDEX `delivery_stops_sequence_idx` ON `delivery_stops` (`sequenceNumber`);