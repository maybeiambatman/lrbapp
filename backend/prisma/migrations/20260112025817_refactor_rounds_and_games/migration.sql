/*
  Warnings:

  - You are about to drop the column `purseTotal` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `roundNumber` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `tripId` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `roundNumber` on the `Prize` table. All the data in the column will be lost.
  - You are about to drop the column `tripId` on the `Prize` table. All the data in the column will be lost.
  - You are about to drop the column `courseId` on the `RoundScore` table. All the data in the column will be lost.
  - You are about to drop the column `roundNumber` on the `RoundScore` table. All the data in the column will be lost.
  - You are about to drop the column `roundNumber` on the `TeeTime` table. All the data in the column will be lost.
  - You are about to drop the column `tripId` on the `TeeTime` table. All the data in the column will be lost.
  - You are about to drop the column `numberOfRounds` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `purseTotal` on the `Trip` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[roundId,playerId]` on the table `RoundScore` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `roundId` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roundId` to the `RoundScore` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roundId` to the `TeeTime` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_tripId_fkey";

-- DropForeignKey
ALTER TABLE "Prize" DROP CONSTRAINT "Prize_tripId_fkey";

-- DropForeignKey
ALTER TABLE "RoundScore" DROP CONSTRAINT "RoundScore_courseId_fkey";

-- DropForeignKey
ALTER TABLE "RoundScore" DROP CONSTRAINT "RoundScore_tripId_fkey";

-- DropForeignKey
ALTER TABLE "TeeTime" DROP CONSTRAINT "TeeTime_tripId_fkey";

-- DropIndex
DROP INDEX "Game_tripId_idx";

-- DropIndex
DROP INDEX "Game_tripId_roundNumber_idx";

-- DropIndex
DROP INDEX "Prize_tripId_idx";

-- DropIndex
DROP INDEX "RoundScore_tripId_playerId_roundNumber_key";

-- DropIndex
DROP INDEX "RoundScore_tripId_roundNumber_idx";

-- DropIndex
DROP INDEX "TeeTime_tripId_roundNumber_idx";

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "purseTotal",
DROP COLUMN "roundNumber",
DROP COLUMN "tripId",
ADD COLUMN     "roundId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Prize" DROP COLUMN "roundNumber",
DROP COLUMN "tripId",
ADD COLUMN     "gameId" TEXT,
ADD COLUMN     "roundId" TEXT;

-- AlterTable
ALTER TABLE "RoundScore" DROP COLUMN "courseId",
DROP COLUMN "roundNumber",
ADD COLUMN     "roundId" TEXT NOT NULL,
ALTER COLUMN "tripId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TeeTime" DROP COLUMN "roundNumber",
DROP COLUMN "tripId",
ADD COLUMN     "roundId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Trip" DROP COLUMN "numberOfRounds",
DROP COLUMN "purseTotal";

-- CreateTable
CREATE TABLE "Round" (
    "id" TEXT NOT NULL,
    "tripId" TEXT,
    "courseId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "roundNumber" INTEGER,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Round_tripId_idx" ON "Round"("tripId");

-- CreateIndex
CREATE INDEX "Round_courseId_idx" ON "Round"("courseId");

-- CreateIndex
CREATE INDEX "Round_date_idx" ON "Round"("date");

-- CreateIndex
CREATE INDEX "Game_roundId_idx" ON "Game"("roundId");

-- CreateIndex
CREATE INDEX "Prize_roundId_idx" ON "Prize"("roundId");

-- CreateIndex
CREATE INDEX "Prize_gameId_idx" ON "Prize"("gameId");

-- CreateIndex
CREATE INDEX "RoundScore_roundId_idx" ON "RoundScore"("roundId");

-- CreateIndex
CREATE INDEX "RoundScore_tripId_idx" ON "RoundScore"("tripId");

-- CreateIndex
CREATE UNIQUE INDEX "RoundScore_roundId_playerId_key" ON "RoundScore"("roundId", "playerId");

-- CreateIndex
CREATE INDEX "TeeTime_roundId_idx" ON "TeeTime"("roundId");

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeeTime" ADD CONSTRAINT "TeeTime_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prize" ADD CONSTRAINT "Prize_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prize" ADD CONSTRAINT "Prize_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundScore" ADD CONSTRAINT "RoundScore_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;
