/*
  Warnings:

  - The primary key for the `AccessLog` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `AccessLog` table. All the data in the column will be lost.
  - The primary key for the `ChangeLog` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ChangeLog` table. All the data in the column will be lost.
  - You are about to drop the column `editFile` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `filePermission` on the `File` table. All the data in the column will be lost.
  - The primary key for the `FileRequest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `FileRequest` table. All the data in the column will be lost.
  - The primary key for the `Token` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `additionalAddress` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `zipCode` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Contains` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Contains` DROP FOREIGN KEY `Contains_idFile_fkey`;

-- DropForeignKey
ALTER TABLE `Contains` DROP FOREIGN KEY `Contains_idMessage_fkey`;

-- AlterTable
ALTER TABLE `AccessLog` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD PRIMARY KEY (`fileId`, `userId`);

-- AlterTable
ALTER TABLE `ChangeLog` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD PRIMARY KEY (`fileId`, `userId`);

-- AlterTable
ALTER TABLE `File` DROP COLUMN `editFile`,
    DROP COLUMN `filePermission`;

-- AlterTable
ALTER TABLE `FileRequest` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD PRIMARY KEY (`senderId`, `fileId`, `groupId`);

-- AlterTable
ALTER TABLE `Token` DROP PRIMARY KEY,
    ADD PRIMARY KEY (`token`, `userId`);

-- AlterTable
ALTER TABLE `User` DROP COLUMN `additionalAddress`,
    DROP COLUMN `address`,
    DROP COLUMN `zipCode`;

-- DropTable
DROP TABLE `Contains`;
