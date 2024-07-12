import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { ServiceStack } from "./service_stack";
import { ApiGatewayStack } from "./api_gateway_stack";
import { S3BucketStack } from "./s3Bucket-stack";

interface ProductServiceStackProps extends cdk.StackProps {
	MONGO_URI: string;
}

export class ProductServiceStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: ProductServiceStackProps) {
		super(scope, id, props);

		const { bucket } = new S3BucketStack(this, "productImages");

		const {
			productsService,
			categoryService,
			dealsService,
			imageService,
			queueService,
		} = new ServiceStack(this, "ProductService", {
			bucket: bucket.bucketName,
			MONGO_URI: props?.MONGO_URI!,
		});

		bucket.grantReadWrite(imageService);

		new ApiGatewayStack(this, "ProductApiGateway", {
			productsService,
			categoryService,
			dealsService,
			imageService,
			queueService,
		});
	}
}
