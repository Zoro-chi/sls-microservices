// import { S3 } from "aws-sdk";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuid } from "uuid";
import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";

const s3Client = new S3Client({ region: "eu-central-1" });

export const handler = async (
	event: APIGatewayEvent,
	context: Context
): Promise<APIGatewayProxyResult> => {
	// Grab file name from query string
	const file = event.queryStringParameters?.file;

	// Create S3 Params
	const fileName = `${uuid()}__${file}`;

	const s3Params = {
		Bucket: process.env.BUCKET_NAME,
		Key: fileName,
		ContentType: "image/jpeg",
	};

	const command = new PutObjectCommand(s3Params);

	// Get signed URL
	const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
	// Return signed URL for client to upload image
	console.log("UPLOAD URL: ", s3Params, signedUrl);

	return {
		statusCode: 200,
		body: JSON.stringify({
			url: signedUrl,
			key: fileName,
		}),
	};
};
