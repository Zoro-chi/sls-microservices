import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/UserModel";

const APP_SECRET = "appsecret";

export const GetSalt = async () => {
	return await bcrypt.genSalt();
};

export const GetHashPassword = async (password: string, salt: string) => {
	return await bcrypt.hash(password, salt);
};

export const ValidatePassword = async (
	enteredPassword: string,
	savedPassword: string,
	salt: string
) => {
	return (await GetHashPassword(enteredPassword, salt)) === savedPassword;
};

export const GetToken = ({ email, user_id, phone, userType }: UserModel) => {
	return jwt.sign({ email, user_id, phone, userType }, APP_SECRET, { expiresIn: "30d" });
};

export const VerifyToken = async (token: string): Promise<UserModel | false> => {
	try {
		if (token !== "") {
			const payload = await jwt.verify(token.split(" ")[1], APP_SECRET);
			return payload as UserModel;
		}
		return false;
	} catch (error) {
		console.log(error);
		return false;
	}
};
