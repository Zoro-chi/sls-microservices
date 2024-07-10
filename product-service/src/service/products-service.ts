import { APIGatewayEvent } from "aws-lambda";
import { plainToClass } from "class-transformer";

import { ProductsRepository } from "../repository/products-repository";
import { ErrorResponse, SuccessResponse } from "../utility/response";
import { ProductsInput } from "../dto/products-input";
import { AppValidationError } from "../utility/error";
import { CategoryRepository } from "../repository/category-repository";
import { ServiceInput } from "../dto/service-input";

export class ProductsService {
	_repository: ProductsRepository;
	constructor(repository: ProductsRepository) {
		this._repository = repository;
	}

	async ResponseWithError(event: APIGatewayEvent) {
		return ErrorResponse(404, new Error("Resquest method not allowed."));
	}

	async createProduct(event: APIGatewayEvent) {
		const input = plainToClass(ProductsInput, JSON.parse(event.body!));
		const error = await AppValidationError(input);
		if (error) return ErrorResponse(404, error);

		const data = await this._repository.createProduct(input);

		await new CategoryRepository().addItem({
			id: input.category_id,
			products: [data._id as string],
		});
		return SuccessResponse(data);
	}

	async getProducts(event: APIGatewayEvent) {
		const data = await this._repository.getAllProducts();
		return SuccessResponse(data);
	}

	async getProduct(event: APIGatewayEvent) {
		const productId = event.pathParameters?.productsId;
		if (!productId) return ErrorResponse(400, "Product ID is required.");
		const data = await this._repository.getProductById(productId);
		return SuccessResponse(data);
	}

	async updateProduct(event: APIGatewayEvent) {
		const productId = event.pathParameters?.productsId;
		if (!productId) return ErrorResponse(400, "Product ID is required.");

		const body = JSON.parse(event.body!);
		const input = plainToClass(ProductsInput, body);
		const error = await AppValidationError(input);
		if (error) return ErrorResponse(404, error);

		input.id = productId;
		const data = await this._repository.updateProduct(input);

		return SuccessResponse(data);
	}

	async deleteProduct(event: APIGatewayEvent) {
		const productId = event.pathParameters?.productsId;
		if (!productId) return ErrorResponse(400, "Product ID is required.");
		const { category_id, deleteResult } = await this._repository.deleteProduct(productId);
		await new CategoryRepository().removeItem({ id: category_id, products: [productId] });
		return SuccessResponse(deleteResult);
	}

	async handleQueueOperations(event: APIGatewayEvent) {
		const input = plainToClass(ServiceInput, JSON.parse(event.body!));
		const error = await AppValidationError(input);
		if (error) return ErrorResponse(404, error);

		console.log("INPUT", input);
		const { _id, name, price, image_url } = await this._repository.getProductById(
			input.productId
		);
		console.log("PRODUCT DETAILS", { _id, name, price, image_url });

		return SuccessResponse({
			product_id: _id,
			name,
			price,
			image_url,
		});
	}
}
