import { LoginInput } from "./LoginInput";
import { Length } from "class-validator";

export class SignupInput extends LoginInput {
	@Length(10, 15)
	phone: string;
}
