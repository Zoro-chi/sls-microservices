import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

export const SendEmailUsingSES = async (to: string, message: string) => {
	const params = {
		Destination: {
			CcAddresses: ["zorochi@icloud.com"],
			ToAddresses: [to],
		},
		Message: {
			Body: {
				Html: {
					Charset: "UTF-8",
					Data: message,
				},
				Text: {
					Charset: "UTF-8",
					Data: message,
				},
			},
			Subject: {
				Charset: "UTF-8",
				Data: "Test Email",
			},
		},
		Source: "zorochi@icloud.com",
		ReplyToAddresses: ["zorochi@icloud.com"],
	};

	try {
		const sesClient = new SESClient({ region: "eu-central-1" });
		const command = new SendEmailCommand(params);
		const response = await sesClient.send(command);
		console.log("Email sent successfully:", response);
	} catch (error) {
		console.error("Error sending email:", error);
	}
};

// import sendgrid from "@sendgrid/mail";
// import dotenv from "dotenv";
// dotenv.config();

// const SENDGRID_API_KEY = process.env.SEND_GRID_API_KEY; //! Get from SendGrid
// const FROM_EMAIL = process.env.FROM_EMAIL; //! Get from SendGrid
// const TEMP_ORDER_CONF = ""; //! Get from SendGrid

// sendgrid.setApiKey(SENDGRID_API_KEY!);

// export interface EmailTemplate {
// 	to: string;
// 	from: string;
// 	templateId: string;
// 	dynamic_template_data: Record<string, unknown>;
// }

// export const ORDER_CONFIRMATION = (
// 	email: string,
// 	firstName: string,
// 	orderNumber: string
// ): EmailTemplate => {
// 	return {
// 		to: email,
// 		from: FROM_EMAIL!,
// 		dynamic_template_data: {
// 			name: firstName,
// 			order_number: orderNumber,
// 		},
// 		templateId: TEMP_ORDER_CONF!,
// 	};
// };

// export const SendEmail = async (template: EmailTemplate) => {
// 	try {
// 		await sendgrid.send(template);
// 		return true;
// 	} catch (error) {
// 		console.log(error);
// 		return false;
// 	}
// };
