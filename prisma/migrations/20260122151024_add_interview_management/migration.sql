-- AlterTable
ALTER TABLE `application` ADD COLUMN `interviewDate` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `InterviewAdmin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'interview_admin',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `InterviewAdmin_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InterviewMarking` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `applicationId` INTEGER NOT NULL,
    `writtenExam` INTEGER NULL,
    `technicalViva` INTEGER NULL,
    `projectRating` INTEGER NULL,
    `markedById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `InterviewMarking_applicationId_key`(`applicationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MarkingPermission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `interviewAdminId` INTEGER NOT NULL,
    `writtenExam` BOOLEAN NOT NULL DEFAULT false,
    `technicalViva` BOOLEAN NOT NULL DEFAULT false,
    `project` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `MarkingPermission_interviewAdminId_key`(`interviewAdminId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MailConfig` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `senderEmail` VARCHAR(191) NOT NULL,
    `clientId` TEXT NOT NULL,
    `clientSecret` TEXT NOT NULL,
    `refreshToken` TEXT NOT NULL,
    `notificationSubject` VARCHAR(191) NULL,
    `notificationBody` TEXT NULL,
    `isAutoReplyEnabled` BOOLEAN NOT NULL DEFAULT false,
    `autoReplyTemplateId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MailTemplate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MailTemplate_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PageSeo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `page` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `keywords` TEXT NULL,
    `ogImage` VARCHAR(191) NULL,
    `jsonLd` TEXT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PageSeo_page_key`(`page`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SliderImage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `InterviewMarking` ADD CONSTRAINT `InterviewMarking_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `Application`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InterviewMarking` ADD CONSTRAINT `InterviewMarking_markedById_fkey` FOREIGN KEY (`markedById`) REFERENCES `InterviewAdmin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MarkingPermission` ADD CONSTRAINT `MarkingPermission_interviewAdminId_fkey` FOREIGN KEY (`interviewAdminId`) REFERENCES `InterviewAdmin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MailConfig` ADD CONSTRAINT `MailConfig_autoReplyTemplateId_fkey` FOREIGN KEY (`autoReplyTemplateId`) REFERENCES `MailTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
