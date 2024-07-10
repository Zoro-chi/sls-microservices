import { Client } from "pg";

export const DBClient = () => {
	return new Client({
		user: "transaction_service",
		host: "ec2-3-76-203-147.eu-central-1.compute.amazonaws.com",
		database: "transaction_service",
		password: "transaction_service#23",
		port: 5432,
	});
};
