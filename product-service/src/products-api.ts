import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { ErrorResponse } from "./utility/response";
import { ProductsService } from "./service/products-service";
import { ProductsRepository } from "./repository/products-repository";
import "./utility";

const service = new ProductsService(new ProductsRepository());

export const handler = async (
	event: APIGatewayEvent,
	context: Context
): Promise<APIGatewayProxyResult> => {
	const isRoot = event.pathParameters === null;

	switch (event.httpMethod.toLowerCase()) {
		case "post":
			if (isRoot) {
				return service.createProduct(event);
			}
			break;
		case "get":
			return isRoot ? service.getProducts(event) : service.getProduct(event);
		case "put":
			if (!isRoot) {
				return service.updateProduct(event);
			}
			break;
		case "delete":
			if (!isRoot) {
				return service.deleteProduct(event);
			}
			break;
	}
	return ErrorResponse(404, "Resquest method not allowed.");
};
