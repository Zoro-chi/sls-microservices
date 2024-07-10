import { APIGatewayProxyEventV2 } from "aws-lambda";
import { plainToClass } from "class-transformer";
import { autoInjectable } from "tsyringe";

import { SuccessResponse, ErrorResponse } from "../utility/response";
import { UserRepository } from "../repository/userRepository";
import { SignupInput } from "../models/dto/SignupInput";
import { LoginInput } from "../models/dto/LoginInput";
import { AppValidationError } from "../utility/error";
import {
	GetHashPassword,
	GetSalt,
	GetToken,
	ValidatePassword,
	VerifyToken,
} from "../utility/password";
import { GenerateAccessToken } from "../utility/notification";
import { VerificationInput } from "../models/dto/UpdateInput";
import { TimeDifference } from "../utility/dateHelper";
import { ProfileInput } from "../models/dto/AddressInput";

@autoInjectable()
export class UserService {
	repository: UserRepository;
	constructor(repository: UserRepository) {
		this.repository = repository;
	}

	async ResponseWithError(event: APIGatewayProxyEventV2) {
		return ErrorResponse(404, "Requested method not supported");
	}

	//* User Creation, Validation and Login
	async CreateUser(event: APIGatewayProxyEventV2) {
		try {
			const body = await JSON.parse(event.body);

			const input = plainToClass(SignupInput, body);
			const errors = await AppValidationError(input);
			if (errors) return ErrorResponse(404, errors);

			const salt = await GetSalt();
			const hashedPassword = await GetHashPassword(input.password, salt);
			const data = await this.repository.createAccount({
				email: input.email,
				password: hashedPassword,
				salt: salt,
				phone: input.phone,
				userType: "BUYER",
			});

			return SuccessResponse(data);
		} catch (error) {
			console.log(error);
			return ErrorResponse(500, error);
		}
	}

	async UserLogin(event: APIGatewayProxyEventV2) {
		try {
			console.log(process.env);
			const body = await JSON.parse(event.body);

			const input = plainToClass(LoginInput, body);
			const errors = await AppValidationError(input);
			if (errors) return ErrorResponse(404, errors);

			const data = await this.repository.findAccount(input.email);
			const verified = await ValidatePassword(
				input.password,
				data.password,
				data.salt
			);
			if (!verified) throw new Error("Password is incorrect");

			const token = await GetToken(data);

			return SuccessResponse({ token });
		} catch (error) {
			console.log(error);
			return ErrorResponse(500, error);
		}
	}

	async GetVerificationToken(event: APIGatewayProxyEventV2) {
		const token = await event.headers.authorization;
		const payload = await VerifyToken(token);
		if (!payload) return ErrorResponse(403, "Authorization failed");

		const { code, expiry } = await GenerateAccessToken();

		await this.repository.updateVerificationCode(payload.user_id, code, expiry);
		console.log(code, expiry);

		// const response = await SendVerificationCode(code, payload.phone);
		return SuccessResponse({
			message: "verification sent to your registered mobile number",
		});
	}

	async VerifyUser(event: APIGatewayProxyEventV2) {
		const body = await JSON.parse(event.body);
		const token = await event.headers.authorization;
		const payload = await VerifyToken(token);
		if (!payload) return ErrorResponse(403, "Authorization failed");

		const input = plainToClass(VerificationInput, body);
		const errors = await AppValidationError(input);
		if (errors) return ErrorResponse(404, errors);

		const { verification_code, expiry } = await this.repository.findAccount(
			payload.email
		);

		// find user account
		if (verification_code === parseInt(input.code)) {
			// compare verification code and expiry
			const currentTime = new Date();
			const timeDiff = await TimeDifference(
				expiry,
				currentTime.toISOString(),
				"m"
			);
			console.log("Time difference: ", timeDiff);
			if (timeDiff > 0) {
				console.log("Verified successfully");
				await this.repository.updateVerifiedUser(payload.user_id);
			} else {
				return ErrorResponse(403, "verification code expired");
			}
			// update user account
			await this.repository.updateVerificationCode(
				payload.user_id,
				0,
				new Date()
			);
		}
		return SuccessResponse({ message: "user verified" });
	}

	//* User Profile
	async CreateProfile(event: APIGatewayProxyEventV2) {
		try {
			const body = await JSON.parse(event.body);
			const token = await event.headers.authorization;
			const payload = await VerifyToken(token);
			if (!payload) return ErrorResponse(403, "Authorization failed");

			const input = plainToClass(ProfileInput, body);
			const errors = await AppValidationError(input);
			if (errors) return ErrorResponse(404, errors);

			const result = await this.repository.createProfile(
				payload.user_id,
				input
			);

			return SuccessResponse({ message: "Profile created" });
		} catch (error) {
			console.log(error);
			return ErrorResponse(500, error);
		}
	}

	async GetProfile(event: APIGatewayProxyEventV2) {
		try {
			const token = await event.headers.authorization;
			const payload = await VerifyToken(token);
			if (!payload) return ErrorResponse(403, "Authorization failed");

			const result = await this.repository.getUserProfile(payload.user_id);

			return SuccessResponse(result);
		} catch (error) {
			console.log(error);
			return ErrorResponse(500, error);
		}
	}

	async UpdateProfile(event: APIGatewayProxyEventV2) {
		try {
			const body = await JSON.parse(event.body);
			const token = await event.headers.authorization;
			const payload = await VerifyToken(token);
			if (!payload) return ErrorResponse(403, "Authorization failed");

			const input = plainToClass(ProfileInput, body);
			const errors = await AppValidationError(input);
			if (errors) return ErrorResponse(404, errors);

			await this.repository.editProfile(payload.user_id, input);

			return SuccessResponse({ message: "Profile updated" });
		} catch (error) {
			console.log(error);
			return ErrorResponse(500, error);
		}
	}

	//* Payment
	async CreatePayment(event: APIGatewayProxyEventV2) {
		return SuccessResponse({ message: "response from create payment" });
	}
	async GetPayment(event: APIGatewayProxyEventV2) {
		return SuccessResponse({ message: "response from get payment" });
	}
	async UpdatePayment(event: APIGatewayProxyEventV2) {
		return SuccessResponse({ message: "response from update payment" });
	}
}
