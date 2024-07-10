import { AddItemInput, CategoryInput } from "../dto/category-input";
import { CategoryDoc, categories } from "../model";

export class CategoryRepository {
	constructor() {}

	async createCategory({ name, parentId, imageUrl }: CategoryInput) {
		const newCategory = await categories.create({
			name,
			parentId,
			subCategory: [],
			products: [],
			imageUrl,
		});

		if (parentId) {
			const parentCategory = (await categories.findById(parentId)) as CategoryDoc;
			parentCategory.subCategories = [...parentCategory.subCategories, newCategory];
			await parentCategory.save();
		}

		return newCategory;
	}

	async getAllCategoryies(offset = 0, perPage?: number) {
		return categories
			.find({ parentId: null })
			.populate({
				path: "subCategories",
				model: "categories",
				populate: {
					path: "subCategories",
					model: "categories",
				},
			})
			.skip(offset)
			.limit(perPage ? perPage : 100);
	}

	async getTopCategoryies() {
		return categories
			.find({ parentId: { $ne: null } }, { products: { $slice: 10 } })
			.populate({
				path: "products",
				model: "products",
			})
			.sort({ displayOrder: "descending" })
			.limit(10);
	}

	async getCategoryById(id: string, offset = 0, perPage?: number) {
		return categories
			.findById(id, {
				products: { $slice: [offset, perPage ? perPage : 100] },
			})
			.populate({
				path: "products",
				model: "products",
			});
	}

	async updateCategory({ id, name, displayOrder, imageUrl }: CategoryInput) {
		let category = (await categories.findById(id)) as CategoryDoc;
		category.name = name;
		category.displayOrder = displayOrder;
		category.imageUrl = imageUrl;
		return category.save();
	}

	async deleteCategory(id: string) {
		return categories.deleteOne({ _id: id });
	}

	async addItem({ id, products }: AddItemInput) {
		let category = (await categories.findById(id)) as CategoryDoc;
		category.products = [...category.products, ...products];
		return category.save();
	}

	async removeItem({ id, products }: AddItemInput) {
		let category = (await categories.findById(id)) as CategoryDoc;
		const excludeProducts = category.products.filter((item) => !products.includes(item));
		category.products = excludeProducts;
		return category.save();
	}
}
