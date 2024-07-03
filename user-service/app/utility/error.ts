import { ValidationError, validate } from "class-validator";

export const AppValidationError = async (input: any): Promise<ValidationError[] | false> => {
	const errors = await validate(input, { ValidationError: { target: true } });
	if (errors.length > 0) return errors;
	return false;
};
