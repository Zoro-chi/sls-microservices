import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { ServiceStack } from "./service_stack";
import { ApiGatewayStack } from "./api_gateway_stack";

export class ProductServiceStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);
		const { productsService, categoryService, dealsService } = new ServiceStack(
			this,
			"ProductService",
			{}
		);
		new ApiGatewayStack(this, "ProductApiGateway", {
			productsService,
			categoryService,
			dealsService,
		});
	}
}
