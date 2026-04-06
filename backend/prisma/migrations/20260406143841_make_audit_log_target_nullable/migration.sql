-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_targetEntityId_fkey";

-- AlterTable
ALTER TABLE "audit_logs" ALTER COLUMN "targetEntityId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_targetEntityId_fkey" FOREIGN KEY ("targetEntityId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
