import { IFunction } from "aws-cdk-lib/aws-lambda";

export interface ServiceInterface {
	// Products
	readonly createProduct: IFunction;
	readonly updateProduct: IFunction;
	readonly getProducts: IFunction;
	readonly getSellerProducts: IFunction;
	readonly getProduct: IFunction;
	readonly deleteProduct: IFunction;

	// Categories
	readonly createCategory: IFunction;
	readonly updateCategory: IFunction;
	readonly getCategoryies: IFunction;
	readonly getCategory: IFunction;
	readonly deleteCategory: IFunction;

	// Deals
	readonly createDeals: IFunction;

	// Others
	readonly imageUploader: IFunction;
	readonly messageQueueHandler: IFunction;
}
