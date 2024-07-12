import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { CategoryRepository } from "../repository/category-repository";
import { CategoryService } from "../service/category-service";
import "../utility";

const service = new CategoryService(new CategoryRepository());

export const createCategory = (
	event: APIGatewayEvent,
	context: Context
): Promise<APIGatewayProxyResult> => {
	return service.createCategory(event);
};

export const getCategoryies = (
	event: APIGatewayEvent,
	context: Context
): Promise<APIGatewayProxyResult> => {
	return service.getCategoryies(event);
};

export const getCategory = (
	event: APIGatewayEvent,
	context: Context
): Promise<APIGatewayProxyResult> => {
	return service.getCategory(event);
};

export const updateCategory = (
	event: APIGatewayEvent,
	context: Context
): Promise<APIGatewayProxyResult> => {
	return service.updateCategory(event);
};

export const deleteCategory = (
	event: APIGatewayEvent,
	context: Context
): Promise<APIGatewayProxyResult> => {
	return service.deleteCategory(event);
};
