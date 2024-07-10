CREATE TABLE "shopping_carts" (
    "cart_id" bigserial PRIMARY KEY,
    "user_id" bigint NOT NULL,
    "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "cart_items" (
    "cart_item_id" bigserial PRIMARY KEY,
    "cart_id" bigint NOT NULL,
    "product_id" varchar NOT NULL,
    "name" varchar NOT NULL,
    "price" bigint NOT NULL,
    "image_url" varchar NOT NULL,
    "item_qty" integer NOT NULL,
    "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE INDEX ON "cart_items" ("product_id");

-- Add Relation
ALTER TABLE "cart_items" ADD FOREIGN KEY ("cart_id") REFERENCES "shopping_carts" ("cart_id");
ALTER TABLE "shopping_carts" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("user_id");