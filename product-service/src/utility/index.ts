import { ConnectDB } from "./db-connection";

ConnectDB()
	.then(() => {
		console.log("Connected to MongoDB");
	})
	.catch((error) => console.log(error));
