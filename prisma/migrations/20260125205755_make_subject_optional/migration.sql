-- DropForeignKey
ALTER TABLE "resources" DROP CONSTRAINT "resources_subjectId_fkey";

-- AlterTable
ALTER TABLE "resources" ALTER COLUMN "subjectId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
