CREATE TABLE `analyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`profileUrl` varchar(512) NOT NULL,
	`username` varchar(128),
	`status` enum('completed','failed') NOT NULL DEFAULT 'completed',
	`sourceSignals` json NOT NULL,
	`report` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `analyses_id` PRIMARY KEY(`id`)
);
