import { APIGatewayProxyEventV2 } from "aws-lambda";
import { plainToClass } from "class-transformer";
import { autoInjectable } from "tsyringe";
import dotenv from "dotenv";

import { SuccessResponse, ErrorResponse } from "../utility/response";
import { AppValidationError } from "../utility/error";
import {
	GetHashPassword,
	GetSalt,
	GetToken,
	ValidatePassword,
	VerifyToken,
} from "../utility/password";
// import { GenerateAccessToken, SendVerificationCode } from "../utility/notification";
import { VerificationInput } from "../models/dto/UpdateInput";
import { TimeDifference } from "../utility/dateHelper";
import { CartRepository } from "../repository/cartRepository";
import { CartInput, UpdateCartInput } from "../models/dto/CartInput";
import { CartItemModel } from "../models/CartItemModel";
import { PullData } from "../message-queue";
import aws from "aws-sdk";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { UserRepository } from "../repository/userRepository";
import {
	APPLICATION_FEE,
	CreatePaymentSession,
	RetrievePayment,
	STRIPE_FEE,
} from "../utility/payment";

dotenv.config();

@autoInjectable()
export class CartService {
	repository: CartRepository;
	constructor(repository: CartRepository) {
		this.repository = repository;
	}

	async ResponseWithError(event: APIGatewayProxyEventV2) {
		return ErrorResponse(404, "Requested method not supported");
	}

	//* Cart
	async CreateCart(event: APIGatewayProxyEventV2) {
		try {
			const body = await JSON.parse(event.body);
			const token = event.headers.authorization;
			const payload = await VerifyToken(token);
			if (!payload) return ErrorResponse(403, "authorization failed!");

			const input = plainToClass(CartInput, body);
			const error = await AppValidationError(input);
			if (error) return ErrorResponse(404, error);

			let currentCart = await this.repository.findShoppingCart(payload.user_id);
			if (!currentCart)
				currentCart = await this.repository.createShoppingCart(payload.user_id);

			if (!currentCart) {
				return ErrorResponse(500, "Failed to get product data");
			}

			// find the item if exist
			let currentProduct = await this.repository.findCartItemByProductId(
				input.productId
			);
			if (currentProduct) {
				// if exist update the qty
				await this.repository.updateCartItemByProductId(
					input.productId,
					(currentProduct.item_qty += input.qty)
				);
			} else {
				// if does not call Product service to get product information
				const { data, status } = await PullData({
					action: "PULL_PRODUCT_DATA",
					productId: input.productId,
				});
				console.log("Getting Product", data);
				if (status !== 200) {
					return ErrorResponse(500, "failed to get product data!");
				}

				let cartItem = data.data as CartItemModel;
				cartItem.cart_id = currentCart.cart_id;
				cartItem.item_qty = input.qty;
				// Finally create cart item
				await this.repository.createCartItem(cartItem);
			}

			// return all cart items to client
			const cartItems = await this.repository.findCartItemByCartId(
				currentCart.cart_id
			);

			return SuccessResponse(cartItems);
		} catch (error) {
			console.log(error);
			return ErrorResponse(500, error);
		}
	}

	async GetCart(event: APIGatewayProxyEventV2) {
		try {
			const token = event.headers.authorization;
			const payload = await VerifyToken(token);
			if (!payload) return ErrorResponse(403, "authorization failed!");

			const cartItems = await this.repository.findCartItems(payload.user_id);

			const totalAmount = cartItems.reduce(
				(sum, item) => sum + item.price * item.item_qty,
				0
			);

			const appFee = APPLICATION_FEE(totalAmount) + STRIPE_FEE(totalAmount);

			return SuccessResponse({ cartItems, totalAmount, appFee });
		} catch (error) {
			console.log(error);
			return ErrorResponse(500, error);
		}
	}

	async UpdateCart(event: APIGatewayProxyEventV2) {
		try {
			const body = await JSON.parse(event.body);
			const token = event.headers.authorization;
			const payload = await VerifyToken(token);
			const cartItemId = Number(event.pathParameters.id);
			if (!payload) return ErrorResponse(403, "authorization failed!");

			const input = plainToClass(UpdateCartInput, body);
			const error = await AppValidationError(input);
			if (error) return ErrorResponse(404, error);

			const cartItem = await this.repository.updateCartItemById(
				cartItemId,
				input.qty
			);
			if (!cartItem) {
				return ErrorResponse(404, "Item does not exist");
			}

			return SuccessResponse(cartItem);
		} catch (error) {
			console.log(error);
			return ErrorResponse(500, error);
		}
	}

	async DeleteCart(event: APIGatewayProxyEventV2) {
		try {
			const body = await JSON.parse(event.body);
			const token = event.headers.authorization;
			const payload = await VerifyToken(token);
			const cartItemId = Number(event.pathParameters.id);
			if (!payload) return ErrorResponse(403, "authorization failed!");

			const deletedItem = await this.repository.deleteCartItem(cartItemId);

			return SuccessResponse(deletedItem);
		} catch (error) {
			console.log(error);
			return ErrorResponse(500, error);
		}
	}

	async CollectPayment(event: APIGatewayProxyEventV2) {
		try {
			const token = event.headers.authorization;
			const payload = await VerifyToken(token);
			if (!payload) return ErrorResponse(403, "authorization failed!");

			const { stripe_id, flutterwave_id, email, phone } =
				await new UserRepository().getUserProfile(payload.user_id);

			const cartItems = await this.repository.findCartItems(payload.user_id);

			const total = cartItems.reduce(
				(sum, item) => sum + item.price * item.item_qty,
				0
			);

			const appFee = APPLICATION_FEE(total);
			const stripeFee = STRIPE_FEE(total);
			const amount = total + appFee + stripeFee;

			// Initialize Payment gateway
			const { secret, publishableKey, customerId, paymentId } =
				await CreatePaymentSession({
					email,
					phone,
					amount,
					customerId: stripe_id,
				});

			await new UserRepository().updateUserPayment({
				userId: payload.user_id,
				customerId,
				paymentId,
			});

			return SuccessResponse({ secret, publishableKey });
		} catch (error) {
			console.log(error);
			return ErrorResponse(500, error);
		}
	}

	// async PlaceOrder(event: APIGatewayProxyEventV2) {
	// 	// get cart items
	// 	const token = event.headers.authorization;
	// 	const payload = await VerifyToken(token);
	// 	if (!payload) return ErrorResponse(403, "authorization failed!");

	// 	const { payment_id } = await new UserRepository().getUserProfile(
	// 		payload.user_id
	// 	);

	// 	console.log(payment_id);

	// 	const paymentInfo = await RetrievePayment(payment_id);
	// 	console.log(paymentInfo);

	// 	if (paymentInfo.status === "succeeded") {
	// 		const cartItems = await this.repository.findCartItems(payload.user_id);

	// 		// // Send SNS topic to create Order [Transaction MS] => email to user
	// 		const params = {
	// 			Message: JSON.stringify({
	// 				userId: payload.user_id,
	// 				items: cartItems,
	// 				transaction: paymentInfo,
	// 			}),
	// 			TopicArn: process.env.SNS_TOPIC,
	// 			MessageAttributes: {
	// 				actionType: {
	// 					DataType: "String",
	// 					StringValue: "place_order",
	// 				},
	// 			},
	// 		};
	// 		const sns = new aws.SNS();
	// 		const response = await sns.publish(params).promise();
	// 		console.log(response);
	// 		console.log(JSON.stringify(params));
	// 		return SuccessResponse({ msg: "success", paymentInfo });
	// 	}

	// 	return ErrorResponse(503, new Error("payment failed!"));
	// }

	async PlaceOrder(event: APIGatewayProxyEventV2) {
		try {
			// get cart items
			const token = event.headers.authorization;
			const payload = await VerifyToken(token);
			if (!payload) return ErrorResponse(403, "authorization failed!");

			const { payment_id } = await new UserRepository().getUserProfile(
				payload.user_id
			);

			const paymentInfo = await RetrievePayment(payment_id);

			if (paymentInfo.status === "succeeded") {
				const cartItems = await this.repository.findCartItems(payload.user_id);

				// Send SNS topic to create Order [Transaction MS] => email to user
				const params = {
					Message: JSON.stringify({
						userId: payload.user_id,
						items: cartItems,
						transaction: paymentInfo,
					}),
					TopicArn: process.env.SNS_TOPIC,
					MessageAttributes: {
						actionType: {
							DataType: "String",
							StringValue: "place_order",
						},
					},
				};

				// Validate SNS_TOPIC ARN
				if (
					!process.env.SNS_TOPIC ||
					process.env.SNS_TOPIC.split(":").length < 6
				) {
					return ErrorResponse(500, "Invalid SNS_TOPIC ARN");
				}

				// Initialize SNS client
				const snsClient = new SNSClient({ region: "eu-central-1" });

				// Publish message to SNS topic
				const command = new PublishCommand(params);
				const response = await snsClient.send(command);

				console.log("SNS publish response:", response);

				// Perform other actions like updating payment ID and deleting cart items
				// Update payment id = ""
				// Delete all cart items

				return SuccessResponse({ msg: "Success", paymentInfo });
			}

			return ErrorResponse(503, new Error("payment failed!"));
		} catch (error) {
			console.log(error);
			return ErrorResponse(500, error.message || "Internal server error");
		}
	}
}
