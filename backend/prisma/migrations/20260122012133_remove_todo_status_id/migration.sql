/*
  Warnings:

  - You are about to drop the column `todo_status_id` on the `todo` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `todo` DROP FOREIGN KEY `todo_todo_status_id_fkey`;

-- DropIndex
DROP INDEX `todo_todo_status_id_fkey` ON `todo`;

-- AlterTable
ALTER TABLE `todo` DROP COLUMN `todo_status_id`;
