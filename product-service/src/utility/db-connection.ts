import mongoose from "mongoose";
import * as dotenv from "dotenv";
mongoose.set("strictQuery", false);
dotenv.config();

const ConnectDB = async () => {
	const DB_URI = process.env.MONGO_URI!;

	try {
		await mongoose.connect(DB_URI);
	} catch (error) {
		console.log(error);
	}
};

export { ConnectDB };
