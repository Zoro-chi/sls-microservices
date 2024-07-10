import { Client } from "pg";
import fs from "fs";
import path from "path";

// const sslOptions = {
// 	rejectUnauthorized: true,
// 	ca: fs.readFileSync(path.resolve(__dirname, "rds-combined-ca-bundle.pem")).toString(),
// };

// export const DBClient = () => {
// 	return new Client({
// 		user: "user_service",
// 		host: "user-service-db.c5sa2qmuww87.eu-central-1.rds.amazonaws.com",
// 		database: "user_service",
// 		password: "user_service#23",
// 		port: 5432,
// 		// ssl: false, //Disable SSL for Local Machine
// 		// ssl: sslOptions, //Enable SSL for AWS
// 	});
// };

export const DBClient = () => {
	return new Client({
		user: "user_service",
		host: "ec2-3-76-203-147.eu-central-1.compute.amazonaws.com",
		database: "user_service",
		password: "user_service#23",
		port: 5432,
	});
};
