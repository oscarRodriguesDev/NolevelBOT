/*
  Warnings:

  - Added the required column `telefone` to the `cpfsLeads` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cpfsLeads" ADD COLUMN     "telefone" TEXT NOT NULL;
