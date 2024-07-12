import { APIGatewayEvent } from "aws-lambda";
import { plainToClass } from "class-transformer";

import { ProductsRepository } from "../repository/products-repository";
import { ErrorResponse, SuccessResponse } from "../utility/response";
import { ProductsInput } from "../dto/products-input";
import { AppValidationError } from "../utility/error";
import { CategoryRepository } from "../repository/category-repository";
import { ServiceInput } from "../dto/service-input";
import { AuthUser } from "../utility/auth";

export class ProductsService {
	_repository: ProductsRepository;
	constructor(repository: ProductsRepository) {
		this._repository = repository;
	}

	async ResponseWithError(event: APIGatewayEvent) {
		return ErrorResponse(404, new Error("Resquest method not allowed."));
	}

	async authorizedUser(user_id: number, productId: string) {
		const product = await this._repository.getProductById(productId);
		if (!product) return false;
		return Number(user_id) === Number(product.seller_id);
	}

	async createProduct(event: APIGatewayEvent) {
		// Validate User is an authorized seller
		const token = event.headers.Authorization;
		const user = await AuthUser(token);
		if (!user) return ErrorResponse(403, "Authorization failed.");
		if (user.user_type.toUpperCase() !== "SELLER") {
			return ErrorResponse(
				403,
				"You need to join the seller program to create products."
			);
		}

		const input = plainToClass(ProductsInput, JSON.parse(event.body!));
		const error = await AppValidationError(input);
		if (error) return ErrorResponse(404, error);

		const data = await this._repository.createProduct({
			...input,
			seller_id: user.user_id,
		});

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

	async getSellerProducts(event: APIGatewayEvent) {
		// Validate User is an authorized seller
		const token = event.headers.Authorization;
		const user = await AuthUser(token);
		if (!user) return ErrorResponse(403, "Authorization failed.");
		if (user.user_type.toUpperCase() !== "SELLER") {
			return ErrorResponse(
				403,
				"You need to join the seller program to manage products."
			);
		}

		const data = await this._repository.getAllSellerProducts(user.user_id);
		return SuccessResponse(data);
	}

	async getProduct(event: APIGatewayEvent) {
		const productId = event.pathParameters?.productsId;
		if (!productId) return ErrorResponse(400, "Product ID is required.");
		const data = await this._repository.getProductById(productId);
		return SuccessResponse(data);
	}

	async updateProduct(event: APIGatewayEvent) {
		// Validate User is an authorized seller
		const token = event.headers.Authorization;
		const user = await AuthUser(token);
		if (!user) return ErrorResponse(403, "Authorization failed.");
		if (user.user_type.toUpperCase() !== "SELLER") {
			return ErrorResponse(
				403,
				"You need to join the seller program to manage products."
			);
		}

		const productId = event.pathParameters?.productsId;
		if (!productId) return ErrorResponse(400, "Product ID is required.");

		const body = JSON.parse(event.body!);
		const input = plainToClass(ProductsInput, body);
		const error = await AppValidationError(input);
		if (error) return ErrorResponse(404, error);

		const isAuthorized = await this.authorizedUser(user.user_id, productId);
		if (!isAuthorized) {
			return ErrorResponse(403, "You are not authorized to edit this product.");
		}

		input.id = productId;
		const data = await this._repository.updateProduct(input);

		return SuccessResponse(data);
	}

	async deleteProduct(event: APIGatewayEvent) {
		// Validate User is an authorized seller
		const token = event.headers.Authorization;
		const user = await AuthUser(token);
		if (!user) return ErrorResponse(403, "Authorization failed.");
		if (user.user_type.toUpperCase() !== "SELLER") {
			return ErrorResponse(
				403,
				"You need to join the seller program to manage products."
			);
		}

		const productId = event.pathParameters?.productsId;
		if (!productId) return ErrorResponse(400, "Product ID is required.");

		const isAuthorized = await this.authorizedUser(user.user_id, productId);
		if (!isAuthorized) {
			return ErrorResponse(
				403,
				"You are not authorized to delete this product."
			);
		}

		const { category_id, deleteResult } = await this._repository.deleteProduct(
			productId
		);

		await new CategoryRepository().removeItem({
			id: category_id,
			products: [productId],
		});
		return SuccessResponse(deleteResult);
	}

	async handleQueueOperations(event: APIGatewayEvent) {
		const input = plainToClass(ServiceInput, JSON.parse(event.body!));
		const error = await AppValidationError(input);
		if (error) return ErrorResponse(404, error);

		console.log("INPUT", input);
		const { _id, name, price, image_url } =
			await this._repository.getProductById(input.productId);
		console.log("PRODUCT DETAILS", { _id, name, price, image_url });

		return SuccessResponse({
			product_id: _id,
			name,
			price,
			image_url,
		});
	}
}
