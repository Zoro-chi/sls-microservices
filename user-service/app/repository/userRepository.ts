import { AddressModel } from "../models/AddressModel";
import { ProfileInput } from "../models/dto/AddressInput";
import { UserModel } from "../models/UserModel";
import { DBClient } from "../utility/databaseClient";
import { DBOperations } from "./dbOperations";

export class UserRepository extends DBOperations {
	constructor() {
		super();
	}

	async createAccount({ email, password, salt, phone, user_type }: UserModel) {
		const queryString = `INSERT INTO users (email, password, salt, phone, user_type) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
		const values = [email, password, salt, phone, user_type];
		const result = await this.executeQuery(queryString, values);

		if (result.rowCount > 0) {
			return result.rows[0] as UserModel;
		}
	}

	async findAccount(email: string) {
		const queryString = `SELECT user_id, email, password, phone, salt, verification_code, expiry, user_type FROM users WHERE email = $1`;
		const values = [email];
		const result = await this.executeQuery(queryString, values);

		if (result.rowCount < 1) {
			throw new Error("User not found with the provided email");
		}

		return result.rows[0] as UserModel;
	}

	async updateVerificationCode(userId: number, code: number, expiry: Date) {
		const queryString = `UPDATE users SET verification_code=$1, expiry=$2 WHERE user_id=$3 AND verified=FALSE RETURNING *`;
		const values = [code, expiry, userId];
		const result = await this.executeQuery(queryString, values);

		if (result.rowCount > 0) {
			return result.rows[0] as UserModel;
		}
		throw new Error("User already verified");
	}

	async updateVerifiedUser(userId: number) {
		const queryString = `UPDATE users SET verified=TRUE WHERE user_id=$1 AND verified=FALSE RETURNING *`;
		const values = [userId];
		const result = await this.executeQuery(queryString, values);

		if (result.rowCount > 0) {
			return result.rows[0] as UserModel;
		}
		throw new Error("User already verified");
	}

	async updateUser(
		user_id: number,
		firstName: string,
		lastName: string,
		userType: string
	) {
		const queryString = `UPDATE users SET first_name=$1, last_name=$2, user_type=$3 WHERE user_id=$4 RETURNING *`;
		const values = [firstName, lastName, userType, user_id];
		const result = await this.executeQuery(queryString, values);

		if (result.rowCount > 0) {
			return result.rows[0] as UserModel;
		}
		throw new Error("Error while updating user");
	}

	async createProfile(
		user_id: number,
		{
			firstName,
			lastName,
			userType,
			address: { addressLine1, addressLine2, city, postCode, country },
		}: ProfileInput
	) {
		await this.updateUser(user_id, firstName, lastName, userType);

		const queryString = `INSERT INTO address (user_id, address_line1, address_line2, city, post_code, country) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
		const values = [
			user_id,
			addressLine1,
			addressLine2,
			city,
			postCode,
			country,
		];
		const result = await this.executeQuery(queryString, values);

		if (result.rowCount > 0) {
			return result.rows[0] as AddressModel;
		}

		throw new Error("Error while creating profile");
	}

	async getUserProfile(user_id: number) {
		const profileQuery = `SELECT first_name, last_name, email, phone, user_type, verified, stripe_id, payment_id FROM users WHERE user_id=$1`;
		const profileValues = [user_id];
		const profileResult = await this.executeQuery(profileQuery, profileValues);
		if (profileResult.rowCount < 1) {
			throw new Error("User profile does not exist");
		}
		const userProfile = profileResult.rows[0] as UserModel;

		const addressQuery = `SELECT id, address_line1, address_line2, city, post_code, country FROM address WHERE user_id=$1`;
		const addressValues = [user_id];
		const addressResult = await this.executeQuery(addressQuery, addressValues);
		if (addressResult.rowCount > 0) {
			userProfile.address = addressResult.rows as AddressModel[];
		}

		return userProfile;
	}

	async editProfile(
		user_id: number,
		{
			firstName,
			lastName,
			userType,
			address: { addressLine1, addressLine2, city, postCode, country, id },
		}: ProfileInput
	) {
		await this.updateUser(user_id, firstName, lastName, userType);
		const addressQuery = `UPDATE address SET address_line1=$1, address_line2=$2, city=$3, post_code=$4, country=$5 WHERE id=$6`;
		const addressValues = [
			addressLine1,
			addressLine2,
			city,
			postCode,
			country,
			id,
		];
		const addressResult = await this.executeQuery(addressQuery, addressValues);

		if (addressResult.rowCount < 1) {
			throw new Error("Error while updating address");
		}

		return true;
	}

	async updateUserPayment({
		userId,
		paymentId,
		customerId,
	}: {
		userId: number;
		paymentId: string;
		customerId: string;
	}) {
		const queryString = `UPDATE users SET stripe_id=$1, payment_id=$2 WHERE user_id=$3 RETURNING *`;
		const values = [customerId, paymentId, userId];
		const result = await this.executeQuery(queryString, values);

		if (result.rowCount > 0) {
			return result.rows[0] as UserModel;
		}
		throw new Error("Error while updating user payment details");
	}
}
