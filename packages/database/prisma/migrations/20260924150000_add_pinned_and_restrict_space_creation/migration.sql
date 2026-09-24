-- AlterTable
ALTER TABLE "instance_settings" ADD COLUMN "restrict_space_creation_to_admins" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "polls" ADD COLUMN "pinned" BOOLEAN NOT NULL DEFAULT false;
