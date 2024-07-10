import { ProductsInput } from "../dto/products-input";
import { ProductDoc, products } from "../model";

export class ProductsRepository {
	constructor() {}

	async createProduct({
		name,
		description,
		category_id,
		price,
		image_url,
	}: ProductsInput): Promise<ProductDoc> {
		return products.create({
			name,
			description,
			category_id,
			price,
			image_url,
			availability: true,
		});
	}

	async getAllProducts(offset = 0, pages?: number) {
		return products
			.find()
			.skip(offset)
			.limit(pages ? pages : 500);
	}

	async getProductById(id: string) {
		return (await products.findById(id)) as ProductDoc;
	}

	async updateProduct({
		id,
		name,
		description,
		category_id,
		price,
		image_url,
		availability,
	}: ProductsInput) {
		let existingProduct = (await products.findById(id)) as ProductDoc;
		existingProduct.name = name;
		existingProduct.description = description;
		existingProduct.category_id = category_id;
		existingProduct.price = price;
		existingProduct.image_url = image_url;
		existingProduct.availability = availability;
		return existingProduct.save();
	}

	async deleteProduct(id: string) {
		const { category_id } = (await products.findById(id)) as ProductDoc;
		const deleteResult = await products.deleteOne({ _id: id });
		return { category_id, deleteResult };
	}
}
