import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { ErrorResponse } from "../utility/response";
import { ProductsService } from "../service/products-service";
import { ProductsRepository } from "../repository/products-repository";
import "../utility";

const service = new ProductsService(new ProductsRepository());

export const createProduct = (
	event: APIGatewayEvent,
	context: Context
): Promise<APIGatewayProxyResult> => {
	return service.createProduct(event);
};

export const getProducts = (
	event: APIGatewayEvent,
	context: Context
): Promise<APIGatewayProxyResult> => {
	return service.getProducts(event);
};

export const getSellerProducts = (
	event: APIGatewayEvent,
	context: Context
): Promise<APIGatewayProxyResult> => {
	return service.getSellerProducts(event);
};

export const getProduct = (
	event: APIGatewayEvent,
	context: Context
): Promise<APIGatewayProxyResult> => {
	return service.getProduct(event);
};

export const updateProduct = (
	event: APIGatewayEvent,
	context: Context
): Promise<APIGatewayProxyResult> => {
	return service.updateProduct(event);
};

export const deleteProduct = (
	event: APIGatewayEvent,
	context: Context
): Promise<APIGatewayProxyResult> => {
	return service.deleteProduct(event);
};
