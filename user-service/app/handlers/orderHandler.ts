import { APIGatewayProxyEventV2 } from "aws-lambda";

import { CartService } from "./../service/cartService";
import { CartRepository } from "./../repository/cartRepository";

const cartService = new CartService(new CartRepository());

export const CollectPayment = (event: APIGatewayProxyEventV2) => {
	return cartService.CollectPayment(event);
};

export const PlaceOrder = (event: APIGatewayProxyEventV2) => {
	return cartService.PlaceOrder(event);
};
