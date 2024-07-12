import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { ProductsService } from "../service/products-service";
import { ProductsRepository } from "../repository/products-repository";
import "../utility";

const service = new ProductsService(new ProductsRepository());

export const messageQueueHandler = async (
	event: APIGatewayEvent,
	context: Context
): Promise<APIGatewayProxyResult> => {
	return service.handleQueueOperations(event);
};
