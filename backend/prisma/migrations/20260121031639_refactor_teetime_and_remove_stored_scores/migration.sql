/*
  Warnings:

  - You are about to drop the column `player1Score` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `player2Score` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `roundNumber` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `team1Score` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `team2Score` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `playerIds` on the `TeeTime` table. All the data in the column will be lost.
  - You are about to drop the column `roundId` on the `TeeTime` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[teeTimeId,playerId]` on the table `Round` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `playerId` to the `Round` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `time` on the `TeeTime` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "TeeTime" DROP CONSTRAINT "TeeTime_roundId_fkey";

-- DropIndex
DROP INDEX "Match_roundNumber_idx";

-- DropIndex
DROP INDEX "TeeTime_roundId_idx";

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "player1Score",
DROP COLUMN "player2Score",
DROP COLUMN "roundNumber",
DROP COLUMN "team1Score",
DROP COLUMN "team2Score";

-- AlterTable
ALTER TABLE "Round" ADD COLUMN     "playerId" TEXT NOT NULL,
ADD COLUMN     "teeTimeId" TEXT;

-- AlterTable
ALTER TABLE "TeeTime" DROP COLUMN "playerIds",
DROP COLUMN "roundId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "tripId" TEXT,
DROP COLUMN "time",
ADD COLUMN     "time" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Round_teeTimeId_idx" ON "Round"("teeTimeId");

-- CreateIndex
CREATE INDEX "Round_playerId_idx" ON "Round"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "Round_teeTimeId_playerId_key" ON "Round"("teeTimeId", "playerId");

-- CreateIndex
CREATE INDEX "TeeTime_tripId_idx" ON "TeeTime"("tripId");

-- CreateIndex
CREATE INDEX "TeeTime_time_idx" ON "TeeTime"("time");

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_teeTimeId_fkey" FOREIGN KEY ("teeTimeId") REFERENCES "TeeTime"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "TripPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeeTime" ADD CONSTRAINT "TeeTime_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
