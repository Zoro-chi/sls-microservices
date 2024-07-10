import { APIGatewayProxyEventV2 } from "aws-lambda";

import { CartService } from "./../service/cartService";
import { CartRepository } from "./../repository/cartRepository";

const cartService = new CartService(new CartRepository());

export const CreatePayment = (event: APIGatewayProxyEventV2) => {
	// return cartService.CreatePayment(event);
};
