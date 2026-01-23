-- AlterTable
ALTER TABLE `todo` ADD COLUMN `updated_at` DATETIME(3) NULL;
UPDATE `todo` SET `updated_at` = `created_at`;
ALTER TABLE `todo` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
