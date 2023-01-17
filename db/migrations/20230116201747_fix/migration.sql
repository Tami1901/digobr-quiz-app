/*
  Warnings:

  - You are about to drop the `_GroupUserToQuestion` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `isInitial` to the `QuestionSolution` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_GroupUserToQuestion" DROP CONSTRAINT "_GroupUserToQuestion_A_fkey";

-- DropForeignKey
ALTER TABLE "_GroupUserToQuestion" DROP CONSTRAINT "_GroupUserToQuestion_B_fkey";

-- AlterTable
ALTER TABLE "QuestionSolution" ADD COLUMN     "isInitial" BOOLEAN NOT NULL,
ALTER COLUMN "answerIndex" DROP NOT NULL;

-- DropTable
DROP TABLE "_GroupUserToQuestion";
