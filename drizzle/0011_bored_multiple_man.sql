CREATE TYPE "public"."plan" AS ENUM('anon', 'starter', 'pro', 'enterprise');--> statement-breakpoint
CREATE TABLE "entities" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"logo" text,
	"description" text,
	"sector" text,
	"kpis" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "entities" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "favorite_entities" (
	"list_id" varchar(191) NOT NULL,
	"entity_id" varchar(191) NOT NULL,
	"order" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "favorite_entities" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "favorite_lists" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"user_id" varchar(255),
	"team_id" varchar(191),
	"name" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "favorite_lists" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "knowledge_base" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"user_id" varchar(255),
	"team_id" varchar(191),
	"content" text NOT NULL,
	"embedding" vector(1536)
);
--> statement-breakpoint
ALTER TABLE "knowledge_base" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "team_members" (
	"team_id" varchar(191) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"role" varchar(256) DEFAULT 'member' NOT NULL,
	"api_quota" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "team_members" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "teams" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"owner_id" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "teams" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "users_metadata" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"plan" "plan" DEFAULT 'anon' NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"usage_limit" integer DEFAULT 5 NOT NULL,
	"usage_current" integer DEFAULT 0 NOT NULL,
	"last_reset_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users_metadata" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "favorite_entities" ADD CONSTRAINT "favorite_entities_list_id_favorite_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."favorite_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_entities" ADD CONSTRAINT "favorite_entities_entity_id_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_lists" ADD CONSTRAINT "favorite_lists_user_id_users_metadata_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users_metadata"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_lists" ADD CONSTRAINT "favorite_lists_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_base" ADD CONSTRAINT "knowledge_base_user_id_users_metadata_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users_metadata"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_base" ADD CONSTRAINT "knowledge_base_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_users_metadata_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users_metadata"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_owner_id_users_metadata_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users_metadata"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "entities_name_idx" ON "entities" USING btree ("name");--> statement-breakpoint
CREATE INDEX "favorite_entities_list_id_idx" ON "favorite_entities" USING btree ("list_id");--> statement-breakpoint
CREATE INDEX "favorite_lists_user_id_idx" ON "favorite_lists" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "favorite_lists_team_id_idx" ON "favorite_lists" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "knowledge_base_user_id_idx" ON "knowledge_base" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "knowledge_base_team_id_idx" ON "knowledge_base" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "team_members_team_id_idx" ON "team_members" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "team_members_user_id_idx" ON "team_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "teams_owner_id_idx" ON "teams" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "users_metadata_stripe_customer_id_idx" ON "users_metadata" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE POLICY "anyone_can_read_entities" ON "entities" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "users_manage_own_favorite_entities" ON "favorite_entities" AS PERMISSIVE FOR ALL TO public USING (EXISTS (
        SELECT 1 FROM "favorite_lists"
        WHERE "favorite_lists".id = list_id
        AND "favorite_lists".user_id = current_setting('app.current_user_id', true)
      )) WITH CHECK (EXISTS (
        SELECT 1 FROM "favorite_lists"
        WHERE "favorite_lists".id = list_id
        AND "favorite_lists".user_id = current_setting('app.current_user_id', true)
      ));--> statement-breakpoint
CREATE POLICY "users_manage_own_favorite_lists" ON "favorite_lists" AS PERMISSIVE FOR ALL TO public USING (user_id = current_setting('app.current_user_id', true)) WITH CHECK (user_id = current_setting('app.current_user_id', true));--> statement-breakpoint
CREATE POLICY "users_manage_own_knowledge_base" ON "knowledge_base" AS PERMISSIVE FOR ALL TO public USING (user_id = current_setting('app.current_user_id', true)) WITH CHECK (user_id = current_setting('app.current_user_id', true));--> statement-breakpoint
CREATE POLICY "members_read_team_info" ON "team_members" AS PERMISSIVE FOR SELECT TO public USING (user_id = current_setting('app.current_user_id', true));--> statement-breakpoint
CREATE POLICY "owners_manage_teams" ON "teams" AS PERMISSIVE FOR ALL TO public USING (owner_id = current_setting('app.current_user_id', true)) WITH CHECK (owner_id = current_setting('app.current_user_id', true));--> statement-breakpoint
CREATE POLICY "users_manage_own_metadata" ON "users_metadata" AS PERMISSIVE FOR ALL TO public USING (id = current_setting('app.current_user_id', true)) WITH CHECK (id = current_setting('app.current_user_id', true));