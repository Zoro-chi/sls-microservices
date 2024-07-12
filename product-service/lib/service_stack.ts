import { Duration } from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import {
	NodejsFunction,
	NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";

import { ServiceInterface } from "./serviceInterface";

interface ServiceProps {
	bucket: string;
	MONGO_URI: string;
}

export class ServiceStack extends Construct {
	public readonly services: ServiceInterface;

	constructor(scope: Construct, id: string, props: ServiceProps) {
		super(scope, id);

		const funcProps: NodejsFunctionProps = {
			bundling: {
				externalModules: ["aws-sdk"],
			},
			environment: {
				BUCKET_NAME: props.bucket,
				MONGO_URI: props.MONGO_URI,
			},
			runtime: Runtime.NODEJS_18_X,
			timeout: Duration.seconds(10),
		};

		this.services = {
			createProduct: this.createHandler(funcProps, "createProduct"),
			updateProduct: this.createHandler(funcProps, "updateProduct"),
			getProduct: this.createHandler(funcProps, "getProduct"),
			getProducts: this.createHandler(funcProps, "getProducts"),
			deleteProduct: this.createHandler(funcProps, "deleteProduct"),
			getSellerProducts: this.createHandler(funcProps, "getSellerProducts"),

			createCategory: this.createHandler(funcProps, "createCategory"),
			updateCategory: this.createHandler(funcProps, "updateCategory"),
			getCategory: this.createHandler(funcProps, "getCategory"),
			getCategoryies: this.createHandler(funcProps, "getCategoryies"),
			deleteCategory: this.createHandler(funcProps, "deleteCategory"),

			createDeals: this.createHandler(funcProps, "createDeals"),

			imageUploader: this.createHandler(funcProps, "imageUploader"),

			messageQueueHandler: this.createHandler(funcProps, "messageQueueHandler"),
		};
	}

	createHandler(props: NodejsFunctionProps, handler: string): NodejsFunction {
		return new NodejsFunction(this, handler, {
			entry: join(__dirname, `../src/handlers/index.ts`),
			handler: handler,
			...props,
		});
	}
}
