import "reflect-metadata";
import { Duration } from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import {
	NodejsFunction,
	NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";

interface ServiceProps {
	SEND_GRID_API_KEY: string;
	FROM_EMAIL: string;
	TEMP_ORDER_CONF: string;
	TWILIO_ACCOUNT_SID: string;
	TWILIO_AUTH_TOKEN: string;
}

export class ServiceStack extends Construct {
	public readonly emailHandler: NodejsFunction;
	public readonly smsHandler: NodejsFunction;

	constructor(scope: Construct, id: string, props: ServiceProps) {
		super(scope, id);

		const functionProps: NodejsFunctionProps = {
			bundling: {
				externalModules: ["aws-sdk"],
			},
			environment: {
				SEND_GRID_API_KEY: props.SEND_GRID_API_KEY,
				FROM_EMAIL: props.FROM_EMAIL,
				TEMP_ORDER_CONF: props.TEMP_ORDER_CONF,
				TWILIO_ACCOUNT_SID: props.TWILIO_ACCOUNT_SID,
				TWILIO_AUTH_TOKEN: props.TWILIO_AUTH_TOKEN,
			},
			runtime: Runtime.NODEJS_18_X,
			timeout: Duration.seconds(120),
		};
		this.emailHandler = this.createHandlers(
			functionProps,
			"CustomerEmailHandler"
		);
		this.smsHandler = this.createHandlers(functionProps, "CustomerSmsHandler");
	}

	createHandlers(props: NodejsFunctionProps, handler: string): NodejsFunction {
		return new NodejsFunction(this, handler, {
			entry: join(__dirname, "/../src/handlers/index.ts"),
			handler: handler,
			...props,
		});
	}
}
