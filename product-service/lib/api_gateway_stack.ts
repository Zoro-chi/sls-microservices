import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { aws_apigateway } from "aws-cdk-lib";

import { ServiceInterface } from "./serviceInterface";

interface ApiGatewayStackProps {
	services: ServiceInterface;
}

type MethodType = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface Method {
	methodType: MethodType;
	handler: IFunction;
}

interface ResourceType {
	name: string;
	methods: Method[];
}

export class ApiGatewayStack extends Construct {
	constructor(scope: Construct, id: string, props: ApiGatewayStackProps) {
		super(scope, id);
		this.addResources("product", props);
	}

	addResources(serviceName: string, { services }: ApiGatewayStackProps) {
		const apgw = new aws_apigateway.RestApi(this, `${serviceName}-ApiGtw`);

		// Products Endpoints
		const productResource = this.createEndpoints(apgw, {
			name: "products",
			methods: [
				{
					methodType: "GET",
					handler: services.getProducts,
				},
				{
					methodType: "POST",
					handler: services.createProduct,
				},
			],
		});

		this.addChildEndpoint(productResource, {
			name: "{productsId}",
			methods: [
				{
					methodType: "GET",
					handler: services.getProduct,
				},
				{
					methodType: "PUT",
					handler: services.updateProduct,
				},
				{
					methodType: "DELETE",
					handler: services.deleteProduct,
				},
			],
		});

		this.createEndpoints(apgw, {
			name: "seller-products",
			methods: [
				{
					methodType: "GET",
					handler: services.getSellerProducts,
				},
			],
		});

		// Category Endpoints
		const categoryResource = this.createEndpoints(apgw, {
			name: "category",
			methods: [
				{
					methodType: "GET",
					handler: services.getCategoryies,
				},
				{
					methodType: "POST",
					handler: services.createCategory,
				},
			],
		});

		this.addChildEndpoint(categoryResource, {
			name: "{categoryId}",
			methods: [
				{
					methodType: "GET",
					handler: services.getCategory,
				},
				{
					methodType: "PUT",
					handler: services.updateCategory,
				},
				{
					methodType: "DELETE",
					handler: services.deleteCategory,
				},
			],
		});

		// Deals Endpoints
		this.createEndpoints(apgw, {
			name: "deals",
			methods: [
				{
					methodType: "POST",
					handler: services.createDeals,
				},
			],
		});

		// Others Endpoints
		this.createEndpoints(apgw, {
			name: "uploader",
			methods: [
				{
					methodType: "GET",
					handler: services.imageUploader,
				},
			],
		});

		this.createEndpoints(apgw, {
			name: "products-queue",
			methods: [
				{
					methodType: "POST",
					handler: services.messageQueueHandler,
				},
			],
		});
	}

	createEndpoints(resource: RestApi, { name, methods }: ResourceType) {
		const rootResource = resource.root.addResource(name);
		methods.map((item) => {
			const lambdaFunction = new LambdaIntegration(item.handler);
			rootResource.addMethod(item.methodType, lambdaFunction);
		});
		return rootResource;
	}

	addChildEndpoint(
		rootResource: aws_apigateway.Resource,
		{ name, methods }: ResourceType
	) {
		const childResource = rootResource.addResource(name);
		methods.map((item) => {
			const lambdaFunction = new LambdaIntegration(item.handler);
			childResource.addMethod(item.methodType, lambdaFunction);
		});
	}
}
