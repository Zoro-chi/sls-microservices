import { plainToClass } from "class-transformer";
import { APIGatewayEvent } from "aws-lambda";

import { AppValidationError } from "../utility/error";
import { CategoryInput } from "../dto/category-input";
import { CategoryRepository } from "../repository/category-repository";
import { ErrorResponse, SuccessResponse } from "../utility/response";
import { AuthUser } from "../utility/auth";

export class CategoryService {
	_repository: CategoryRepository;
	constructor(repository: CategoryRepository) {
		this._repository = repository;
	}

	async ResponseWithError(event: APIGatewayEvent) {
		return ErrorResponse(404, new Error("Resquest method not allowed."));
	}

	async createCategory(event: APIGatewayEvent) {
		// Validate User is an authorized seller
		const token = event.headers.Authorization;
		const user = await AuthUser(token);
		if (!user) return ErrorResponse(403, "Authorization failed.");
		if (user.user_type.toUpperCase() !== "SELLER") {
			return ErrorResponse(
				403,
				"You need to join the seller program to create a category."
			);
		}

		const body = JSON.parse(event.body!);
		const input = plainToClass(CategoryInput, body);
		const error = await AppValidationError(input);
		if (error) return ErrorResponse(400, error);

		const data = await this._repository.createCategory(input);

		return SuccessResponse(data);
	}

	async getCategoryies(event: APIGatewayEvent) {
		const type = event.queryStringParameters?.type;
		if (type === "top") {
			const data = await this._repository.getTopCategoryies();
			return SuccessResponse(data);
		}
		const data = await this._repository.getAllCategoryies();
		return SuccessResponse(data);
	}

	async getCategory(event: APIGatewayEvent) {
		const categoryId = event.pathParameters?.categoryId;
		const offset = Number(event.queryStringParameters?.offset);
		const perPage = Number(event.queryStringParameters?.perPage);
		if (!categoryId) return ErrorResponse(400, "Category ID is required.");
		const data = await this._repository.getCategoryById(
			categoryId,
			offset,
			perPage
		);
		return SuccessResponse(data);
	}

	async updateCategory(event: APIGatewayEvent) {
		//TODO: Make it that only Admin can update category

		const categoryId = event.pathParameters?.categoryId;
		if (!categoryId) return ErrorResponse(400, "Category ID is required.");

		const body = JSON.parse(event.body!);
		const input = plainToClass(CategoryInput, body);
		const error = await AppValidationError(input);
		if (error) return ErrorResponse(404, error);

		input.id = categoryId;
		const data = await this._repository.updateCategory(input);

		return SuccessResponse(data);
	}

	async deleteCategory(event: APIGatewayEvent) {
		//TODO: Make it that only Admin can delete category

		const categoryId = event.pathParameters?.categoryId;
		if (!categoryId) return ErrorResponse(400, "Category ID is required.");
		const data = await this._repository.deleteCategory(categoryId);
		return SuccessResponse(data);
	}
}
