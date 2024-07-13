import { SQSEvent } from "aws-lambda";
import { plainToClass } from "class-transformer";

import { EmailInput } from "../dto/email.dto";
import { AppValidationError } from "../utility/errors";
import { SendEmailUsingSES } from "../providers/email";

export const CustomerEmailHandler = async (event: SQSEvent) => {
	const response: Record<string, unknown>[] = [];

	console.log("EMAIL HANDLER");

	const promises = event.Records.map(async (record) => {
		const input = plainToClass(EmailInput, JSON.parse(record.body));
		const errors = await AppValidationError(input);

		console.log("ERRORS", JSON.stringify(errors));

		if (!errors) {
			const { to, name, order_number } = input;
			const message = `Hello ${name}, your order number is ${order_number}`;
			await SendEmailUsingSES(to, message);
			// const OrderTemplate = ORDER_CONFIRMATION(to, name, order_number);
			// await SendEmail(OrderTemplate);
		} else {
			response.push({ error: JSON.stringify(errors) });
		}
	});

	await Promise.all(promises);

	console.log("SQS response", response);

	return { response };
};
