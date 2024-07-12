import { APIGatewayProxyEventV2 } from "aws-lambda";
import { plainToClass } from "class-transformer";

import { SellerRepository } from "../repository/sellerRepository";
import { GetToken, VerifyToken } from "../utility/password";
import { ErrorResponse, SuccessResponse } from "../utility/response";
import {
	PaymentMethodInput,
	SellerProgramInput,
} from "../models/dto/JoinSellerProgramInput";
import { AppValidationError } from "../utility/error";

export class SellerService {
	repository: SellerRepository;

	constructor(repository: SellerRepository) {
		this.repository = repository;
	}

	async JoinSellerProgram(event: APIGatewayProxyEventV2) {
		const body = await JSON.parse(event.body);
		const authToken = event.headers.authorization;
		const payload = await VerifyToken(authToken);
		if (!payload) return ErrorResponse(403, "Authorization failed");

		const input = plainToClass(SellerProgramInput, body);
		const error = await AppValidationError(input);
		if (error) return ErrorResponse(404, error);

		const { firstName, lastName, phoneNumber, address } = input;

		const enrolled = await this.repository.checkEnrolledProgram(
			payload.user_id
		);

		if (enrolled)
			return ErrorResponse(
				403,
				"You are already enrolled in this program, you can sell your products now."
			);

		// Update User
		const updatedUser = await this.repository.updateProfile({
			firstName,
			lastName,
			phoneNumber,
			user_id: payload.user_id,
		});
		if (!updatedUser)
			return ErrorResponse(500, "Error occure while joining Seller Program");

		// Update Address
		await this.repository.updateAddress({
			...address,
			user_id: payload.user_id,
		});

		// Create Payment Method
		const result = await this.repository.createPaymentMethod({
			...input,
			user_id: payload.user_id,
		});

		// Signed Token
		if (result) {
			const token = await GetToken(updatedUser);

			return SuccessResponse({
				message: "You have successfully joined the Seller Program",
				seller: {
					token,
					email: updatedUser.email,
					firstName: updatedUser.first_name,
					lastName: updatedUser.last_name,
					phone: updatedUser.phone,
					userType: updatedUser.user_type,
					_id: updatedUser.user_id,
				},
			});
		} else {
			return ErrorResponse(500, "Error occure while joining Seller Program");
		}
	}

	async GetPaymentMethod(event: APIGatewayProxyEventV2) {
		const body = await JSON.parse(event.body);
		const authToken = event.headers.authorization;
		const payload = await VerifyToken(authToken);
		if (!payload) return ErrorResponse(403, "Authorization failed");

		const paymentMethods = await this.repository.getPaymentMethods(
			payload.user_id
		);

		return SuccessResponse({ paymentMethods });
	}

	async EditPaymentMethod(event: APIGatewayProxyEventV2) {
		const body = await JSON.parse(event.body);
		const authToken = event.headers.authorization;
		const payload = await VerifyToken(authToken);
		if (!payload) return ErrorResponse(403, "Authorization failed");

		const input = plainToClass(PaymentMethodInput, body);
		const error = await AppValidationError(input);
		if (error) return ErrorResponse(404, error);

		const payment_id = Number(event.pathParameters.id);

		const result = await this.repository.updatePaymentMethod({
			...input,
			payment_id,
			user_id: payload.user_id,
		});

		if (result) {
			return SuccessResponse({
				message: "Payment Method updated successfully",
			});
		} else {
			return ErrorResponse(500, "Error occure while updating Payment Method");
		}
	}
}
