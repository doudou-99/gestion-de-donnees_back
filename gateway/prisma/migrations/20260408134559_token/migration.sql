/*
  Warnings:

  - The primary key for the `Token` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The values [SHARE_TOKEN] on the enum `Token_type` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[type,userId]` on the table `Token` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Token` DROP PRIMARY KEY,
    MODIFY `type` ENUM('REFRESHTOKEN', 'ACTIVATEACCOUNT', 'RESETPASSWORD') NOT NULL,
    ADD PRIMARY KEY (`token`);

-- CreateIndex
CREATE UNIQUE INDEX `Token_type_userId_key` ON `Token`(`type`, `userId`);
