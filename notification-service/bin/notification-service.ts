#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import * as dotenv from "dotenv";
dotenv.config();

import { NotificationServiceStack } from "../lib/notification-service-stack";

const app = new cdk.App();
new NotificationServiceStack(app, "NotificationServiceStack", {
	env: {
		account: process.env.CDK_DEFAULT_ACCOUNT,
		region: process.env.CDK_DEFAULT_REGION,
	},
	SEND_GRID_API_KEY: process.env.SEND_GRID_API_KEY!,
	FROM_EMAIL: process.env.FROM_EMAIL!,
	TEMP_ORDER_CONF: process.env.TEMP_ORDER_CONF!,
	TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID!,
	TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN!,
});
