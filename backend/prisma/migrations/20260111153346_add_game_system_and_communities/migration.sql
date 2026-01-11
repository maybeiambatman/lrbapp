-- CreateEnum
CREATE TYPE "RoundStatus" AS ENUM ('NOT_STARTED', 'STARTED', 'FINISHED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "GameFormat" AS ENUM ('BEST_BALL', 'COMBINED_SCORE', 'HIGH_LOW', 'MONEYBALL', 'SKINS', 'NASSAU', 'SCRAMBLE');

-- CreateEnum
CREATE TYPE "GamePlayType" AS ENUM ('MATCH_PLAY', 'STROKE_PLAY');

-- CreateEnum
CREATE TYPE "GameScoringType" AS ENUM ('GROSS', 'NET', 'BOTH');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "location" TEXT;

-- AlterTable
ALTER TABLE "RoundScore" ADD COLUMN     "status" "RoundStatus" NOT NULL DEFAULT 'NOT_STARTED';

-- CreateTable
CREATE TABLE "CourseArchitect" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "yearBuilt" INTEGER,

    CONSTRAINT "CourseArchitect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "format" "GameFormat" NOT NULL,
    "playType" "GamePlayType" NOT NULL,
    "scoringType" "GameScoringType" NOT NULL,
    "roundNumber" INTEGER,
    "buyInAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "purseTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'PENDING',
    "isTeamMatch" BOOLEAN NOT NULL DEFAULT false,
    "team1Id" TEXT,
    "team2Id" TEXT,
    "player1Id" TEXT,
    "player2Id" TEXT,
    "team1Score" DOUBLE PRECISION,
    "team2Score" DOUBLE PRECISION,
    "player1Score" DOUBLE PRECISION,
    "player2Score" DOUBLE PRECISION,
    "winnerId" TEXT,
    "winnerType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "playerIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Community" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Community_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CommunityMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CommunityMembers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "CourseArchitect_courseId_idx" ON "CourseArchitect"("courseId");

-- CreateIndex
CREATE INDEX "Game_tripId_idx" ON "Game"("tripId");

-- CreateIndex
CREATE INDEX "Game_tripId_roundNumber_idx" ON "Game"("tripId", "roundNumber");

-- CreateIndex
CREATE INDEX "Match_gameId_idx" ON "Match"("gameId");

-- CreateIndex
CREATE INDEX "Match_roundNumber_idx" ON "Match"("roundNumber");

-- CreateIndex
CREATE INDEX "Team_gameId_idx" ON "Team"("gameId");

-- CreateIndex
CREATE INDEX "Community_createdBy_idx" ON "Community"("createdBy");

-- CreateIndex
CREATE INDEX "Community_isActive_idx" ON "Community"("isActive");

-- CreateIndex
CREATE INDEX "_CommunityMembers_B_index" ON "_CommunityMembers"("B");

-- AddForeignKey
ALTER TABLE "CourseArchitect" ADD CONSTRAINT "CourseArchitect_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_team1Id_fkey" FOREIGN KEY ("team1Id") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_team2Id_fkey" FOREIGN KEY ("team2Id") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Community" ADD CONSTRAINT "Community_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CommunityMembers" ADD CONSTRAINT "_CommunityMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CommunityMembers" ADD CONSTRAINT "_CommunityMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
