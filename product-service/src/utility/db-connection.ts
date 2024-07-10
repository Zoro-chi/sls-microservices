import mongoose from "mongoose";
mongoose.set("strictQuery", false);
import * as dotenv from "dotenv";
dotenv.config();

const ConnectDB = async () => {
	// console.log("Mongo_URI", process.env.MONGO_URI);
	// const DB_URL = process.env.MONGO_URI!;

	const DB_URL =
		"mongodb+srv://microservice:microservice@atlascluster.mxgmp.mongodb.net/nodejs-sls-microservice";

	try {
		await mongoose.connect(DB_URL);
	} catch (error) {
		console.log(error);
	}
};

export { ConnectDB };
