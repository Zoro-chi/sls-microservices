import { IsString } from "class-validator";

export class SmsInput {
	@IsString()
	phone: string;

	@IsString()
	code: string;
}
