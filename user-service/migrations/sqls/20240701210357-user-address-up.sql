CREATE TABLE "address" (
    "id" bigserial PRIMARY KEY,
    "user_id" bigint NOT NULL,
    "address_line1" TEXT,
    "address_line2" TEXT,
    "city" VARCHAR,
    "post_code" INTEGER,
    "country" VARCHAR,
    "created_at" TIMESTAMP NOT NULL DEFAULT (now())
);

CREATE INDEX ON "address"("city");
CREATE INDEX ON "address"("post_code");
CREATE INDEX ON "address"("country");

-- Add Relationship
ALTER TABLE "address" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("user_id");