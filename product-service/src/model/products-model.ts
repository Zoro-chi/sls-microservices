import mongoose from "mongoose";

type ProductModel = {
	name: string;
	description: string;
	category_id: string;
	price: number;
	image_url: string;
	availability: boolean;
	seller_id: number;
};

export type ProductDoc = mongoose.Document & ProductModel;

const productSchema = new mongoose.Schema(
	{
		name: String,
		description: String,
		category_id: String,
		price: Number,
		image_url: String,
		availability: Boolean,
		seller_id: Number,
	},
	{
		toJSON: {
			transform: (doc, ret, options) => {
				delete ret.__v;
				delete ret.createdAt;
				delete ret.updatedAt;
			},
		},
		timestamps: true,
	}
);

const products =
	mongoose.models.products ||
	mongoose.model<ProductDoc>("products", productSchema);

export { products };
