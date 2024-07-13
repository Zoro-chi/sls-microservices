import { SQSEvent } from "aws-lambda";
import { plainToClass } from "class-transformer";

import { SmsInput } from "../dto/sms.dto";
import { AppValidationError } from "../utility/errors";
import { SendVerificationCode } from "../providers/sms";

export const CustomerSmsHandler = async (event: SQSEvent) => {
	const response: Record<string, unknown>[] = [];

	const promises = event.Records.map(async (record) => {
		const input = plainToClass(SmsInput, JSON.parse(record.body));
		const errors = AppValidationError(input);
		console.log("ERRORS", JSON.stringify(errors));

		if (!errors) {
			const { phone, code } = input;
			await SendVerificationCode(Number(code), phone.trim());
		} else {
			response.push({ error: JSON.stringify(errors) });
		}
	});

	await Promise.all(promises);

	console.log("SQS response ", JSON.stringify(response));

	return { response };
};
