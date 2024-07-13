import { IsString } from "class-validator";

export class EmailInput {
	@IsString()
	to: string;

	@IsString()
	name: string;

	@IsString()
	order_number: string;
}
