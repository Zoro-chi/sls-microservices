import * as cdk from "aws-cdk-lib";
import { SubscriptionFilter, Topic } from "aws-cdk-lib/aws-sns";
import { SqsSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";

import { ServiceStack } from "./service-stack";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";

interface NotificationServiceStackProps extends cdk.StackProps {
	SEND_GRID_API_KEY: string;
	FROM_EMAIL: string;
	TEMP_ORDER_CONF: string;
	TWILIO_ACCOUNT_SID: string;
	TWILIO_AUTH_TOKEN: string;
}

export class NotificationServiceStack extends cdk.Stack {
	constructor(
		scope: Construct,
		id: string,
		props?: NotificationServiceStackProps
	) {
		super(scope, id, props);

		// Email Queue
		const emailQueue = new Queue(this, "email_queue", {
			visibilityTimeout: cdk.Duration.seconds(120),
		});

		// SMS Queue
		const smsQueue = new Queue(this, "sms_queue", {
			visibilityTimeout: cdk.Duration.seconds(120),
		});

		// Topic  --> customer_email, customer_sms, seller_email, seller_sms
		const topic = new Topic(this, "notification_topic");
		this.addSubscription(topic, emailQueue, ["customer_email"]);
		this.addSubscription(topic, smsQueue, ["customer_sms"]);

		const { emailHandler, smsHandler } = new ServiceStack(
			this,
			"notification_service",
			{
				SEND_GRID_API_KEY: props?.SEND_GRID_API_KEY!,
				FROM_EMAIL: props?.FROM_EMAIL!,
				TEMP_ORDER_CONF: props?.TEMP_ORDER_CONF!,
				TWILIO_ACCOUNT_SID: props?.TWILIO_ACCOUNT_SID!,
				TWILIO_AUTH_TOKEN: props?.TWILIO_AUTH_TOKEN!,
			}
		);
		// Email handler
		emailHandler.addToRolePolicy(
			new PolicyStatement({
				actions: ["ses:SendEmail", "ses:SendRawEmail"],
				resources: ["*"],
				effect: Effect.ALLOW,
			})
		);
		emailHandler.addEventSource(new SqsEventSource(emailQueue));

		// SMS handler
		smsHandler.addEventSource(new SqsEventSource(smsQueue));

		// Add Subscriptions
		new cdk.CfnOutput(this, "NotificationTopic", {
			value: topic.topicArn,
			exportName: "notifySvcArn",
		});
	}

	addSubscription(topic: Topic, queue: Queue, allowlist: string[]) {
		topic.addSubscription(
			new SqsSubscription(queue, {
				rawMessageDelivery: true,
				filterPolicy: {
					actionType: SubscriptionFilter.stringFilter({
						allowlist,
					}),
				},
			})
		);
	}
}
