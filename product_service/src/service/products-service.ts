import { ProductsRepository } from "../repository/products-repository";
import { SuccessResponse } from "../utility/response";

export class ProductsService {
	_repository: ProductsRepository;
	constructor(repository: ProductsRepository) {
		this._repository = repository;
	}

	async createProduct() {
		return SuccessResponse({ message: "Product created successfully." });
	}

	async getProducts() {
		return SuccessResponse({ message: "All products fetched successfully." });
	}

	async getProduct() {
		return SuccessResponse({ message: "Product fetched successfully." });
	}

	async updateProduct() {
		return SuccessResponse({ message: "Product updated successfully." });
	}

	async deleteProduct() {
		return SuccessResponse({ message: "Product deleted successfully." });
	}
}
