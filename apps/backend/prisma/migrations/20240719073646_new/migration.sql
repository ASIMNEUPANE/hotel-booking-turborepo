/*
  Warnings:

  - The primary key for the `Auth` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Auth" DROP CONSTRAINT "Auth_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Auth_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Auth_id_seq";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "created_by" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "roles" "Roles"[] DEFAULT ARRAY['USER']::"Roles"[],
ADD COLUMN     "updated_by" INTEGER NOT NULL DEFAULT 0;
