import express, {NextFunction, Request, Response} from "express";
import {MongoClient} from "mongodb";
import {ImageProvider} from "../ImageProvider";
import {CredentialsProvider} from "../CredentialsProvider";
import dotenv from "dotenv";

import jwt from "jsonwebtoken";

dotenv.config();
const signatureKey = process.env.JWT_SECRET as string;
if (!signatureKey) {
    throw new Error("Missing JWT_SECRET from env file");
}

function generateAuthToken(username: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        jwt.sign(
            { username: username },
            signatureKey,
            { expiresIn: "1d" },
            (error, token) => {
                if (error) reject(error);
                else resolve(token as string);
            }
        );
    });
}

export function verifyAuthToken(
    req: Request,
    res: Response,
    next: NextFunction // Call next() to run the next middleware or request handler
) {
    const authHeader = req.get("Authorization");
    // The header should say "Bearer <token string>".  Discard the Bearer part.
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        res.status(401).end();
    } else { // signatureKey already declared as a module-level variable
        jwt.verify(token, signatureKey, (error, decoded) => {
            if (decoded) {
                res.locals.token = decoded;
                next();
            } else {
                res.status(403).end();
            }
        });
    }
}

export function registerAuthRoutes(app: express.Application, mongoClient: MongoClient) {

    app.post("/auth/register", async (request: Request, res: Response): Promise<void> => {
        try {
            console.log(request.body);
            const { username, password } = request.body;
            if (!username || !password) {
                res.status(400).send({
                    error: "Bad request",
                    message: "Missing username or password"
                });
            }

            const credentialsProvider = new CredentialsProvider(mongoClient);
            const result = await credentialsProvider.registerUser(username, password);

            const authToken = await generateAuthToken(username);

            {result ?
                res.status(201).send({ token: authToken })
                :
                res.status(400).send({
                    error: "Bad request",
                    message: "Username already taken"
                });
            }
        } catch (error) {
            console.error("Error during registration:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    });

    app.post("/auth/login", async (request: Request, res: Response): Promise<void> => {
        try {
            const { username, password } = request.body;
            if (!username || !password) {
                res.status(401).send({
                    error: "Bad request",
                    message: "Missing username or password"
                });
            }
            const credentialsProvider = new CredentialsProvider(mongoClient);
            const verificationRes = await credentialsProvider.verifyPassword(username, password);

            if (verificationRes){
                const authToken = await generateAuthToken(username);
                res.send({ token: authToken });
            } else {
                res.status(401).send({
                    error: "Bad request",
                    message: "Incorrect Username or Password"
                });
            }
        } catch (error) {
            console.error("Error during login:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    })


}