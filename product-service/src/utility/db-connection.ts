import mongoose from "mongoose";
mongoose.set("strictQuery", false);

const ConnectDB = async () => {
	const DB_URL =
		"mongodb+srv://microservice:microservice@atlascluster.mxgmp.mongodb.net/nodejs-sls-microservice";

	try {
		await mongoose.connect(DB_URL);
	} catch (error) {
		console.log(error);
	}
};

export { ConnectDB };
