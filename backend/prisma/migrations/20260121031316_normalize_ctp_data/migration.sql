/*
  Warnings:

  - The values [BOTH] on the enum `GameScoringType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `ctpDistance` on the `RoundScore` table. All the data in the column will be lost.
  - You are about to drop the column `ctpHole` on the `RoundScore` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "GameScoringType_new" AS ENUM ('GROSS', 'NET');
ALTER TABLE "Game" ALTER COLUMN "scoringType" TYPE "GameScoringType_new" USING ("scoringType"::text::"GameScoringType_new");
ALTER TYPE "GameScoringType" RENAME TO "GameScoringType_old";
ALTER TYPE "GameScoringType_new" RENAME TO "GameScoringType";
DROP TYPE "public"."GameScoringType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Prize" ADD COLUMN     "winnerDistance" TEXT;

-- AlterTable
ALTER TABLE "RoundScore" DROP COLUMN "ctpDistance",
DROP COLUMN "ctpHole";
