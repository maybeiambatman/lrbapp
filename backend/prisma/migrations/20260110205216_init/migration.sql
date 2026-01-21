-- CreateEnum
CREATE TYPE "PrizeType" AS ENUM ('CLOSEST_TO_PIN', 'BEST_NET_ROUND', 'BEST_CUMULATIVE_NET', 'CUSTOM');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hole" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "par" INTEGER NOT NULL,
    "handicapRank" INTEGER NOT NULL,
    "yards" INTEGER,

    CONSTRAINT "Hole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tee" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "rating" DOUBLE PRECISION NOT NULL,
    "slope" INTEGER NOT NULL,
    "yardage" INTEGER,

    CONSTRAINT "Tee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "buyInAmount" DOUBLE PRECISION NOT NULL,
    "numberOfRounds" INTEGER NOT NULL,
    "purseTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripPlayer" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "handicap" DOUBLE PRECISION NOT NULL,
    "buyIn" DOUBLE PRECISION NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeeTime" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "time" TEXT NOT NULL,
    "playerIds" TEXT[],

    CONSTRAINT "TeeTime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prize" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PrizeType" NOT NULL,
    "roundNumber" INTEGER,
    "ctpHole" INTEGER,
    "amount" DOUBLE PRECISION NOT NULL,
    "winnerId" TEXT,

    CONSTRAINT "Prize_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoundScore" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "userId" TEXT,
    "playerName" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "courseId" TEXT NOT NULL,
    "handicap" DOUBLE PRECISION NOT NULL,
    "grossTotal" INTEGER NOT NULL DEFAULT 0,
    "netTotal" INTEGER NOT NULL DEFAULT 0,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "ctpHole" INTEGER,
    "ctpDistance" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoundScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HoleScore" (
    "id" TEXT NOT NULL,
    "roundScoreId" TEXT NOT NULL,
    "holeId" TEXT NOT NULL,
    "holeNumber" INTEGER NOT NULL,
    "grossScore" INTEGER NOT NULL,
    "netScore" INTEGER NOT NULL,
    "strokesReceived" INTEGER NOT NULL,

    CONSTRAINT "HoleScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TripCourses" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TripCourses_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Course_createdBy_idx" ON "Course"("createdBy");

-- CreateIndex
CREATE INDEX "Hole_courseId_idx" ON "Hole"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Hole_courseId_number_key" ON "Hole"("courseId", "number");

-- CreateIndex
CREATE INDEX "Tee_courseId_idx" ON "Tee"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Trip_code_key" ON "Trip"("code");

-- CreateIndex
CREATE INDEX "Trip_code_idx" ON "Trip"("code");

-- CreateIndex
CREATE INDEX "Trip_createdBy_idx" ON "Trip"("createdBy");

-- CreateIndex
CREATE INDEX "Trip_isActive_idx" ON "Trip"("isActive");

-- CreateIndex
CREATE INDEX "TripPlayer_tripId_idx" ON "TripPlayer"("tripId");

-- CreateIndex
CREATE UNIQUE INDEX "TripPlayer_tripId_name_key" ON "TripPlayer"("tripId", "name");

-- CreateIndex
CREATE INDEX "TeeTime_tripId_roundNumber_idx" ON "TeeTime"("tripId", "roundNumber");

-- CreateIndex
CREATE INDEX "Prize_tripId_idx" ON "Prize"("tripId");

-- CreateIndex
CREATE INDEX "RoundScore_tripId_roundNumber_idx" ON "RoundScore"("tripId", "roundNumber");

-- CreateIndex
CREATE INDEX "RoundScore_playerId_idx" ON "RoundScore"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "RoundScore_tripId_playerId_roundNumber_key" ON "RoundScore"("tripId", "playerId", "roundNumber");

-- CreateIndex
CREATE INDEX "HoleScore_roundScoreId_idx" ON "HoleScore"("roundScoreId");

-- CreateIndex
CREATE UNIQUE INDEX "HoleScore_roundScoreId_holeNumber_key" ON "HoleScore"("roundScoreId", "holeNumber");

-- CreateIndex
CREATE INDEX "_TripCourses_B_index" ON "_TripCourses"("B");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hole" ADD CONSTRAINT "Hole_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tee" ADD CONSTRAINT "Tee_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripPlayer" ADD CONSTRAINT "TripPlayer_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeeTime" ADD CONSTRAINT "TeeTime_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prize" ADD CONSTRAINT "Prize_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundScore" ADD CONSTRAINT "RoundScore_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundScore" ADD CONSTRAINT "RoundScore_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "TripPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundScore" ADD CONSTRAINT "RoundScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundScore" ADD CONSTRAINT "RoundScore_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HoleScore" ADD CONSTRAINT "HoleScore_roundScoreId_fkey" FOREIGN KEY ("roundScoreId") REFERENCES "RoundScore"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HoleScore" ADD CONSTRAINT "HoleScore_holeId_fkey" FOREIGN KEY ("holeId") REFERENCES "Hole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TripCourses" ADD CONSTRAINT "_TripCourses_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TripCourses" ADD CONSTRAINT "_TripCourses_B_fkey" FOREIGN KEY ("B") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
