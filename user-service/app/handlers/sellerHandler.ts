import { APIGatewayProxyEventV2 } from "aws-lambda";

import { SellerRepository } from "../repository/sellerRepository";
import { SellerService } from "../service/sellerService";

const service = new SellerService(new SellerRepository());

export const JoinSellerProgram = (event: APIGatewayProxyEventV2) => {
	return service.JoinSellerProgram(event);
};

export const GetPaymentMethod = (event: APIGatewayProxyEventV2) => {
	return service.GetPaymentMethod(event);
};

export const EditPaymentMethod = (event: APIGatewayProxyEventV2) => {
	return service.EditPaymentMethod(event);
};
