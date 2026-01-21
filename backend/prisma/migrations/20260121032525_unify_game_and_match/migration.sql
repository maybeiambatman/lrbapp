/*
  Warnings:

  - You are about to drop the column `roundId` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the `Match` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_roundId_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_gameId_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_team1Id_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_team2Id_fkey";

-- DropIndex
DROP INDEX "Game_roundId_idx";

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "roundId",
ADD COLUMN     "isTeamGame" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "GameStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "team1Id" TEXT,
ADD COLUMN     "team2Id" TEXT,
ADD COLUMN     "winnerId" TEXT,
ADD COLUMN     "winnerType" TEXT;

-- DropTable
DROP TABLE "Match";

-- DropEnum
DROP TYPE "MatchStatus";

-- CreateTable
CREATE TABLE "GameRound" (
    "gameId" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,

    CONSTRAINT "GameRound_pkey" PRIMARY KEY ("gameId","roundId")
);

-- CreateIndex
CREATE INDEX "GameRound_gameId_idx" ON "GameRound"("gameId");

-- CreateIndex
CREATE INDEX "GameRound_roundId_idx" ON "GameRound"("roundId");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_team1Id_fkey" FOREIGN KEY ("team1Id") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_team2Id_fkey" FOREIGN KEY ("team2Id") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameRound" ADD CONSTRAINT "GameRound_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameRound" ADD CONSTRAINT "GameRound_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;
