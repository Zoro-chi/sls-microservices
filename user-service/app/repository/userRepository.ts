export class UserRepository {
	constructor() {}

	async CreateUser(event: any) {
		console.log("User created in DB");
		return { message: "response from create user" };
	}
}
