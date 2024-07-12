#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import * as dotenv from "dotenv";
dotenv.config();

import { ProductServiceStack } from "../lib/product_service-stack";

const app = new cdk.App();
new ProductServiceStack(app, "ProductServiceStack", {
	env: {
		account: process.env.CDK_DEFAULT_ACCOUNT,
		region: process.env.CDK_DEFAULT_REGION,
	},
	MONGO_URI: process.env.MONGO_URI!,
});
