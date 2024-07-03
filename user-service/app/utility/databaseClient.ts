import { Client } from "pg";

export const DBClient = () => {
	return new Client({
		user: "root",
		host: "127.0.0.1",
		database: "user_service",
		password: "root",
		port: 5432,
	});
};
