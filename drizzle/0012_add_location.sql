ALTER TABLE "entities" RENAME COLUMN "sector" TO "industry";--> statement-breakpoint
ALTER TABLE "entities" ADD COLUMN "location" text;
