import { Collection, MongoClient } from "mongodb";
import bcrypt from "bcrypt";

interface ICredentialsDocument {
    username: string;
    password: string;
}

export class CredentialsProvider {
    private readonly collection: Collection<ICredentialsDocument>;

    constructor(mongoClient: MongoClient) {
        const COLLECTION_NAME = process.env.CREDS_COLLECTION_NAME;
        if (!COLLECTION_NAME) {
            throw new Error("Missing CREDS_COLLECTION_NAME from env file");
        }
        this.collection = mongoClient.db().collection<ICredentialsDocument>(COLLECTION_NAME);
    }

    async registerUser(username: string, plaintextPassword: string) {
        // TODO
        try {
            const existingUser = await this.collection.findOne({username: username});
            if (existingUser) {
                return false;
            }
            // Wait for any DB operations to finish before returning!

            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(plaintextPassword, salt);

            await this.collection.insertOne({
                username,
                password: hashedPassword
            });
        } catch (err) {
            console.error("Error during registration:", err);
            return false;
        }

        return true;
    }

    async verifyPassword(username: string, plaintextPassword: string) {
        // TODO
        try{
            const existingUser = await this.collection.findOne({username: username});
            if (existingUser) {
                const hashedDatabasePassword = existingUser.password;
                return await bcrypt.compare(plaintextPassword, hashedDatabasePassword);
            }
        } catch (err) {
            console.error("Error during verification:", err);
            return false;
        }
    }
}
