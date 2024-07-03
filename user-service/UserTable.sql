CREATE TABLE "users" (
    "user_id" bigserial PRIMARY KEY,
    "phone" VARCHAR NOT NULL,
    "email" VARCHAR NOT NULL,
    "password" VARCHAR NOT NULL,
    "salt" VARCHAR NOT NULL,
    "user_type" VARCHAR NOT NULL,
    "created_at" timestampz NOT NULL DEFAULT (now()),
);