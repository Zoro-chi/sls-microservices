import { Duration } from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";

interface ServiceProps {
	bucket?: any;
}

export class ServiceStack extends Construct {
	public readonly productsService: NodejsFunction;
	public readonly categoryService: NodejsFunction;
	public readonly dealsService: NodejsFunction;

	constructor(scope: Construct, id: string, props: ServiceProps) {
		super(scope, id);

		const nodeJsFunctionProps: NodejsFunctionProps = {
			bundling: {
				externalModules: ["aws-sdk"],
			},
			environment: {
				BUCKET_NAME: "OUR_BUCKET_ARN",
			},
			runtime: Runtime.NODEJS_18_X,
			timeout: Duration.seconds(10),
		};

		this.productsService = new NodejsFunction(this, "productsLambda", {
			entry: join(__dirname, "../src/products-api.ts"),
			...nodeJsFunctionProps,
		});

		this.categoryService = new NodejsFunction(this, "categoryLambda", {
			entry: join(__dirname, "../src/category-api.ts"),
			...nodeJsFunctionProps,
		});

		this.dealsService = new NodejsFunction(this, "dealsLambda", {
			entry: join(__dirname, "../src/deals-api.ts"),
			...nodeJsFunctionProps,
		});
	}
}
