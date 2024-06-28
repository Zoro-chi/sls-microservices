const formatResponse = (statusCode: number, message: string, data: unknown) => {
	if (data) {
		return {
			statusCode,
			headers: {
				"Access-Control-Allow-Origin": "*", // Required for CORS support to work
			},
			body: JSON.stringify({
				message,
				data,
			}),
		};
	} else {
		return {
			statusCode,
			headers: {
				"Access-Control-Allow-Origin": "*", // Required for CORS support to work
			},
			body: JSON.stringify({
				message,
			}),
		};
	}
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
