import { IsNumber, Length } from "class-validator";

export class ProductsInput {
	id: string;

	@Length(3, 120)
	name: string;

	@Length(3, 256)
	description: string;

	category_id: string;

	image_url: string;

	@IsNumber()
	price: number;

	availability: boolean;

	seller_id: number;
}
