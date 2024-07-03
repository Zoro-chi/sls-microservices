import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { ErrorResponse } from "./utility/response";
import { ProductsService } from "./service/products-service";
import { ProductsRepository } from "./repository/products-repository";

const service = new ProductsService(new ProductsRepository());

export const handler = async (
	event: APIGatewayEvent,
	context: Context
): Promise<APIGatewayProxyResult> => {
	const isRoot = event.pathParameters === null;

	switch (event.httpMethod.toLowerCase()) {
		case "post":
			if (isRoot) {
				return service.createProduct();
			}
			break;
		case "get":
			return isRoot ? service.getProducts() : service.getProduct();
		case "put":
			if (!isRoot) {
				return service.updateProduct();
			}
			break;
		case "delete":
			if (!isRoot) {
				return service.deleteProduct();
			}
			break;
	}
	return ErrorResponse(404, "Resquest method not allowed.");
};
