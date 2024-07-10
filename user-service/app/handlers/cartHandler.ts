import { APIGatewayProxyEventV2 } from "aws-lambda";

import { CartService } from "./../service/cartService";
import { CartRepository } from "./../repository/cartRepository";

const cartService = new CartService(new CartRepository());

export const CreateCart = (event: APIGatewayProxyEventV2) => {
	return cartService.CreateCart(event);
};

export const DeleteCart = (event: APIGatewayProxyEventV2) => {
	return cartService.DeleteCart(event);
};

export const EditCart = (event: APIGatewayProxyEventV2) => {
	return cartService.UpdateCart(event);
};

export const GetCart = (event: APIGatewayProxyEventV2) => {
	return cartService.GetCart(event);
};
