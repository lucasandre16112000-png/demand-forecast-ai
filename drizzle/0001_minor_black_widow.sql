CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`userId` int NOT NULL,
	`alertType` enum('high_demand','low_demand','stock_alert','trend_change') NOT NULL,
	`severity` enum('low','medium','high') NOT NULL,
	`message` text NOT NULL,
	`isRead` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `forecasts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`userId` int NOT NULL,
	`forecastDate` timestamp NOT NULL,
	`predictedQuantity` int NOT NULL,
	`predictedRevenue` int NOT NULL,
	`confidence` int NOT NULL,
	`trend` varchar(50),
	`seasonalityFactor` int DEFAULT 100,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `forecasts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`sku` varchar(100),
	`category` varchar(100),
	`price` int NOT NULL,
	`currentStock` int DEFAULT 0,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `salesHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`userId` int NOT NULL,
	`quantity` int NOT NULL,
	`revenue` int NOT NULL,
	`saleDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `salesHistory_id` PRIMARY KEY(`id`)
);
