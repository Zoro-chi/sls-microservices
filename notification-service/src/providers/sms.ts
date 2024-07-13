import twilio from "twilio";
import * as dotenv from "dotenv";
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

let client: twilio.Twilio;
if (accountSid && authToken) {
	client = twilio(accountSid, authToken);
} else {
	throw new Error("Twilio credentials not found in environment variables.");
}

export const SendVerificationCode = async (
	code: number,
	toPhoneNumber: string
) => {
	const response = await client.messages.create({
		body: `Your verification code is ${code}, it will expire in 30 minutes.`,
		from: "+18148852344",
		to: toPhoneNumber.trim(),
	});
	console.log("response", response);
	return response;
};
