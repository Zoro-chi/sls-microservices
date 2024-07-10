import { Client } from "pg";
import * as dotenv from "dotenv";
dotenv.config();

export const DBClient = () => {
	return new Client({
		user: process.env.DB_USER,
		host: process.env.DB_HOST,
		database: process.env.DB_NAME,
		password: process.env.DB_PASS,
		port: parseInt(process.env.DB_PORT || "5432"),
	});
};
