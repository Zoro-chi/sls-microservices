import axios from "axios";

const PRODUCT_SERVICE_URL =
	"https://16bacq263b.execute-api.eu-central-1.amazonaws.com/prod/products-queue"; // "http://127.0.0.1:3000/products-queue";

export const PullData = async (requestData: Record<string, unknown>) => {
	return axios.post(PRODUCT_SERVICE_URL, requestData);
};
