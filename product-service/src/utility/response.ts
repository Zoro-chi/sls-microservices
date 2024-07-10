import { stringify as flattedStringify } from "flatted";

const safeStringify = (data: any) => {
	try {
		return JSON.stringify(data);
	} catch (error) {
		if (error instanceof TypeError && error.message.includes("circular")) {
			return flattedStringify(data);
		}
		throw error; // Rethrow if it's not a circular reference error
	}
};

const formatResponse = (statusCode: number, message: string, data?: unknown) => {
	const body = data ? { message, data } : { message };
	return {
		statusCode,
		headers: {
			"Access-Control-Allow-Origin": "*", // Required for CORS support to work
			"Content-Type": "application/json",
		},
		body: safeStringify(body),
	};
};

export const SuccessResponse = (data: object) => {
	return formatResponse(200, "Success", data);
};

export const ErrorResponse = (code = 1000, error: unknown) => {
	if (Array.isArray(error)) {
		const errorObject = error[0].constraints;
		const errorMessage = errorObject[Object.keys(errorObject)[0]] || "Error Occurred";
		return formatResponse(code, errorMessage, errorMessage);
	}
	return formatResponse(code, `${error}`, error);
};
