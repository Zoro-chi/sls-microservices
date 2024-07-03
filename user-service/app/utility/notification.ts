import twilio from "twilio";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env.local") });

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = twilio(accountSid, authToken);

export const GenerateAccessToken = async () => {
	const code = Math.floor(100000 + Math.random() * 900000);
	let expiry = new Date();
	expiry.setTime(new Date().getTime() + 30 * 60 * 1000);
	return { code, expiry };
};

export const SendVerificationCode = async (code: number, toPhoneNumber: string) => {
	const response = await client.messages.create({
		body: `Your verification code is ${code}, it will expire in 30 minutes.`,
		from: "+18148852344",
		to: toPhoneNumber.trim(),
	});
	console.log("response", response);
	return response;
};
