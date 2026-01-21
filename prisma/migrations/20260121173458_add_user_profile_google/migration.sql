-- CreateEnum
CREATE TYPE "Occupation" AS ENUM ('STUDENT', 'WORKER', 'PROFESSOR');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "occupation" "Occupation" NOT NULL DEFAULT 'STUDENT',
ALTER COLUMN "password" DROP NOT NULL;
