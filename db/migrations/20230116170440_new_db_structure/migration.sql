/*
  Warnings:

  - You are about to drop the column `groupId` on the `QuestionSolution` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `QuestionSolution` table. All the data in the column will be lost.
  - You are about to drop the `_GroupToQuestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_GroupToUser` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[questionId,groupUserId]` on the table `QuestionSolution` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `groupUserId` to the `QuestionSolution` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "QuestionSolution" DROP CONSTRAINT "QuestionSolution_groupId_fkey";

-- DropForeignKey
ALTER TABLE "QuestionSolution" DROP CONSTRAINT "QuestionSolution_userId_fkey";

-- DropForeignKey
ALTER TABLE "_GroupToQuestion" DROP CONSTRAINT "_GroupToQuestion_A_fkey";

-- DropForeignKey
ALTER TABLE "_GroupToQuestion" DROP CONSTRAINT "_GroupToQuestion_B_fkey";

-- DropForeignKey
ALTER TABLE "_GroupToUser" DROP CONSTRAINT "_GroupToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_GroupToUser" DROP CONSTRAINT "_GroupToUser_B_fkey";

-- DropIndex
DROP INDEX "QuestionSolution_userId_questionId_groupId_key";

-- AlterTable
ALTER TABLE "QuestionSolution" DROP COLUMN "groupId",
DROP COLUMN "userId",
ADD COLUMN     "groupUserId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_GroupToQuestion";

-- DropTable
DROP TABLE "_GroupToUser";

-- CreateTable
CREATE TABLE "GroupUser" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,

    CONSTRAINT "GroupUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GroupUserToQuestion" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "GroupUser_userId_groupId_key" ON "GroupUser"("userId", "groupId");

-- CreateIndex
CREATE UNIQUE INDEX "_GroupUserToQuestion_AB_unique" ON "_GroupUserToQuestion"("A", "B");

-- CreateIndex
CREATE INDEX "_GroupUserToQuestion_B_index" ON "_GroupUserToQuestion"("B");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionSolution_questionId_groupUserId_key" ON "QuestionSolution"("questionId", "groupUserId");

-- AddForeignKey
ALTER TABLE "GroupUser" ADD CONSTRAINT "GroupUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupUser" ADD CONSTRAINT "GroupUser_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionSolution" ADD CONSTRAINT "QuestionSolution_groupUserId_fkey" FOREIGN KEY ("groupUserId") REFERENCES "GroupUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupUserToQuestion" ADD CONSTRAINT "_GroupUserToQuestion_A_fkey" FOREIGN KEY ("A") REFERENCES "GroupUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupUserToQuestion" ADD CONSTRAINT "_GroupUserToQuestion_B_fkey" FOREIGN KEY ("B") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
