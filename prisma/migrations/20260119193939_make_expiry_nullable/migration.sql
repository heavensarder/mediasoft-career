/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Job` will be added. If there are existing duplicate values, this will fail.
  - The required column `slug` was added to the `Job` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE `job` DROP FOREIGN KEY `Job_departmentId_fkey`;

-- DropForeignKey
ALTER TABLE `job` DROP FOREIGN KEY `Job_locationId_fkey`;

-- DropForeignKey
ALTER TABLE `job` DROP FOREIGN KEY `Job_typeId_fkey`;

-- AlterTable
ALTER TABLE `application` ADD COLUMN `dynamicData` JSON NULL;

-- AlterTable
ALTER TABLE `department` ADD COLUMN `isSystem` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `job` ADD COLUMN `slug` VARCHAR(191) NOT NULL,
    MODIFY `departmentId` INTEGER NULL,
    MODIFY `typeId` INTEGER NULL,
    MODIFY `locationId` INTEGER NULL,
    MODIFY `expiryDate` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `jobtype` ADD COLUMN `isSystem` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `location` ADD COLUMN `isSystem` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `FormField` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `required` BOOLEAN NOT NULL DEFAULT false,
    `placeholder` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `options` VARCHAR(191) NULL,
    `isSystem` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `FormField_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Job_slug_key` ON `Job`(`slug`);

-- AddForeignKey
ALTER TABLE `Job` ADD CONSTRAINT `Job_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Job` ADD CONSTRAINT `Job_typeId_fkey` FOREIGN KEY (`typeId`) REFERENCES `JobType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Job` ADD CONSTRAINT `Job_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
