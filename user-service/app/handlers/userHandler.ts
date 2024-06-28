import { APIGatewayProxyEventV2 } from "aws-lambda";
import { UserService } from "../service/userService";
import { ErrorResponse } from "../utility/response";
import { container } from "tsyringe";

const service = container.resolve(UserService);

export const Signup = (event: APIGatewayProxyEventV2) => {
	return service.CreateUser(event);
};

export const Login = async (event: APIGatewayProxyEventV2) => {
	return service.UserLogin(event);
};

export const Verify = async (event: APIGatewayProxyEventV2) => {
	return service.VerifyUser(event);
};

export const Profile = async (event: APIGatewayProxyEventV2) => {
	const httpMethod = event.requestContext.http.method.toUpperCase();
	if (httpMethod === "POST") {
		return service.CreateProfile(event);
	} else if (httpMethod === "PUT") {
		return service.UpdateProfile(event);
	} else if (httpMethod === "GET") {
		return service.GetProfile(event);
	} else {
		return ErrorResponse(404, "requested method not supported!");
	}
};

export const Cart = async (event: APIGatewayProxyEventV2) => {
	const httpMethod = event.requestContext.http.method.toUpperCase();
	if (httpMethod === "POST") {
		return service.CreateCart(event);
	} else if (httpMethod === "PUT") {
		return service.UpdateCart(event);
	} else if (httpMethod === "GET") {
		return service.GetCart(event);
	} else {
		return ErrorResponse(404, "requested method not supported!");
	}
};

export const Payment = async (event: APIGatewayProxyEventV2) => {
	const httpMethod = event.requestContext.http.method.toUpperCase();
	if (httpMethod === "POST") {
		return service.CreatePayment(event);
	} else if (httpMethod === "PUT") {
		return service.UpdatePayment(event);
	} else if (httpMethod === "GET") {
		return service.GetPayment(event);
	} else {
		return ErrorResponse(404, "requested method not supported!");
	}
};
