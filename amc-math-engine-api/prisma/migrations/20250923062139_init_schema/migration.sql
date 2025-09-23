-- CreateEnum
CREATE TYPE "public"."SubpathStage" AS ENUM ('BASIC', 'INTERMEDIATE', 'ADVANCED', 'BOSS', 'FINAL');

-- CreateEnum
CREATE TYPE "public"."LevelKind" AS ENUM ('PRACTICE', 'BOSS', 'OLYMPIAD');

-- CreateEnum
CREATE TYPE "public"."ProgressStatus" AS ENUM ('LOCKED', 'AVAILABLE', 'IN_PROGRESS', 'MASTERED');

-- CreateEnum
CREATE TYPE "public"."AttemptOutcome" AS ENUM ('CORRECT', 'INCORRECT', 'PARTIAL', 'SKIPPED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Path" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "themeColor" TEXT,
    "order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Path_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Subpath" (
    "id" TEXT NOT NULL,
    "pathId" TEXT NOT NULL,
    "stage" "public"."SubpathStage" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subpath_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Level" (
    "id" TEXT NOT NULL,
    "subpathId" TEXT NOT NULL,
    "kind" "public"."LevelKind" NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "recommendedDifficulty" INTEGER,
    "estimatedMinutes" INTEGER,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Problem" (
    "id" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "title" TEXT,
    "statement" TEXT NOT NULL,
    "solution" TEXT,
    "source" TEXT,
    "difficulty" INTEGER,
    "tags" TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Problem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProblemHint" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "isMajor" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProblemHint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserProgress" (
    "userId" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "status" "public"."ProgressStatus" NOT NULL DEFAULT 'LOCKED',
    "masteryScore" INTEGER,
    "attemptsCount" INTEGER NOT NULL DEFAULT 0,
    "hintsUsed" INTEGER NOT NULL DEFAULT 0,
    "unlockedAt" TIMESTAMP(3),
    "lastInteraction" TIMESTAMP(3),

    CONSTRAINT "UserProgress_pkey" PRIMARY KEY ("userId","levelId")
);

-- CreateTable
CREATE TABLE "public"."Attempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "outcome" "public"."AttemptOutcome" NOT NULL,
    "approach" TEXT,
    "hintsUsed" INTEGER NOT NULL DEFAULT 0,
    "timeSpentSec" INTEGER,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StoryPanel" (
    "id" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoryPanel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Path_slug_key" ON "public"."Path"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Subpath_pathId_stage_key" ON "public"."Subpath"("pathId", "stage");

-- CreateIndex
CREATE UNIQUE INDEX "Level_subpathId_order_key" ON "public"."Level"("subpathId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "ProblemHint_problemId_order_key" ON "public"."ProblemHint"("problemId", "order");

-- CreateIndex
CREATE INDEX "UserProgress_status_idx" ON "public"."UserProgress"("status");

-- CreateIndex
CREATE UNIQUE INDEX "StoryPanel_levelId_order_key" ON "public"."StoryPanel"("levelId", "order");

-- AddForeignKey
ALTER TABLE "public"."Subpath" ADD CONSTRAINT "Subpath_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "public"."Path"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Level" ADD CONSTRAINT "Level_subpathId_fkey" FOREIGN KEY ("subpathId") REFERENCES "public"."Subpath"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Problem" ADD CONSTRAINT "Problem_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "public"."Level"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProblemHint" ADD CONSTRAINT "ProblemHint_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "public"."Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserProgress" ADD CONSTRAINT "UserProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserProgress" ADD CONSTRAINT "UserProgress_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "public"."Level"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attempt" ADD CONSTRAINT "Attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attempt" ADD CONSTRAINT "Attempt_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "public"."Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StoryPanel" ADD CONSTRAINT "StoryPanel_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "public"."Level"("id") ON DELETE CASCADE ON UPDATE CASCADE;
