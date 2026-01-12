/*
  Warnings:

  - You are about to drop the column `handicapRank` on the `Hole` table. All the data in the column will be lost.
  - You are about to drop the column `yards` on the `Hole` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Hole" DROP COLUMN "handicapRank",
DROP COLUMN "yards";

-- CreateTable
CREATE TABLE "TeeHole" (
    "id" TEXT NOT NULL,
    "teeId" TEXT NOT NULL,
    "holeId" TEXT NOT NULL,
    "yards" INTEGER NOT NULL,
    "handicapRank" INTEGER NOT NULL,

    CONSTRAINT "TeeHole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeeHole_teeId_idx" ON "TeeHole"("teeId");

-- CreateIndex
CREATE INDEX "TeeHole_holeId_idx" ON "TeeHole"("holeId");

-- CreateIndex
CREATE UNIQUE INDEX "TeeHole_teeId_holeId_key" ON "TeeHole"("teeId", "holeId");

-- AddForeignKey
ALTER TABLE "TeeHole" ADD CONSTRAINT "TeeHole_teeId_fkey" FOREIGN KEY ("teeId") REFERENCES "Tee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeeHole" ADD CONSTRAINT "TeeHole_holeId_fkey" FOREIGN KEY ("holeId") REFERENCES "Hole"("id") ON DELETE CASCADE ON UPDATE CASCADE;
