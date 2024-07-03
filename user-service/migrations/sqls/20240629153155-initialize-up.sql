CREATE TABLE users (
    "user_id" BIGSERIAL PRIMARY KEY,
    "phone" VARCHAR NOT NULL,
    "email" VARCHAR UNIQUE NOT NULL,
    "password" VARCHAR NOT NULL,
    "salt" VARCHAR NOT NULL,
    "user_type" VARCHAR NOT NULL,
    "first_name" VARCHAR,
    "last_name" VARCHAR,
    "profile_pic" TEXT,
    "verification_code" INTEGER,
    "expiry" TIMESTAMPTZ,
    "verified" BOOLEAN NOT NULL DEFAULT FALSE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON "users" ("phone");