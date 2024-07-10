import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { aws_apigateway } from "aws-cdk-lib";

interface ApiGatewayStackProps {
	productsService: IFunction;
	categoryService: IFunction;
	dealsService: IFunction;
	imageService: IFunction;
	queueService: IFunction;
}

interface ResourceType {
	name: string;
	method: string[];
	child?: ResourceType;
}

export class ApiGatewayStack extends Construct {
	constructor(scope: Construct, id: string, props: ApiGatewayStackProps) {
		super(scope, id);
		this.addResources("product", props);
	}

	addResources(
		serviceName: string,
		{
			productsService,
			categoryService,
			dealsService,
			imageService,
			queueService,
		}: ApiGatewayStackProps
	) {
		const apgw = new aws_apigateway.RestApi(this, `${serviceName}-ApiGtw`);

		this.createEndpoints(productsService, apgw, {
			name: "products",
			method: ["GET", "POST"],
			child: {
				name: "{productsId}",
				method: ["GET", "PUT", "DELETE"],
			},
		});

		this.createEndpoints(categoryService, apgw, {
			name: "category",
			method: ["GET", "POST"],
			child: {
				name: "{categoryId}",
				method: ["GET", "PUT", "DELETE"],
			},
		});

		this.createEndpoints(dealsService, apgw, {
			name: "deals",
			method: ["GET", "POST"],
			child: {
				name: "{dealsId}",
				method: ["GET", "PUT", "DELETE"],
			},
		});

		this.createEndpoints(imageService, apgw, {
			name: "uploader",
			method: ["GET"],
		});

		this.createEndpoints(queueService, apgw, {
			name: "products-queue",
			method: ["POST"],
		});
	}

	createEndpoints(handler: IFunction, resource: RestApi, { name, method, child }: ResourceType) {
		const lambdaFunction = new LambdaIntegration(handler);
		const rootResource = resource.root.addResource(name);
		method.map((item) => {
			rootResource.addMethod(item, lambdaFunction);
		});

		if (child) {
			const childResource = rootResource.addResource(child.name);
			child.method.map((item) => {
				childResource.addMethod(item, lambdaFunction);
			});
		}
	}
}
