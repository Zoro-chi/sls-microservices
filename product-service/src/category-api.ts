import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { CategoryRepository } from "./repository/category-repository";
import { CategoryService } from "./service/category-service";
import "./utility";

const service = new CategoryService(new CategoryRepository());

export const handler = async (
	event: APIGatewayEvent,
	context: Context
): Promise<APIGatewayProxyResult> => {
	const isRoot = event.pathParameters === null;

	switch (event.httpMethod.toLowerCase()) {
		case "post":
			if (isRoot) {
				return service.createCategory(event);
			}
			break;
		case "get":
			return isRoot ? service.getCategoryies(event) : service.getCategory(event);
		case "put":
			if (!isRoot) {
				return service.updateCategory(event);
			}
			break;
		case "delete":
			if (!isRoot) {
				return service.deleteCategory(event);
			}
			break;
	}
	return service.ResponseWithError(event);
};
