import express, { Request, Response } from "express";
import { MongoClient } from "mongodb";
import { ImageProvider } from "../ImageProvider";

export function registerImageRoutes(app: express.Application, mongoClient: MongoClient) {

    app.get("/api/images", (req: Request, res: Response) => {
        const imgProvider = new ImageProvider(mongoClient);
        let userId: string | undefined = undefined;
        if (typeof req.query.createdBy === "string") {
            userId = req.query.createdBy;
        }
        console.log(`query param: ${userId}`);

        const images = imgProvider.getAllImages(userId);

        images.then((images) => {
            return res.json(images);
        }).catch((err) => {
            console.error("Error fetching images:", err);
            res.status(500).json({ error: "Internal server error" });
        })
    })

    app.patch("/api/images/:id", (req: Request, res: Response) => {
        const imageId = req.params.id;
        const { name } = req.body;
        if (!name) {
            res.status(400).send({
                error: "Bad request",
                message: "Missing name property"
            });
        }

        const imgProvider = new ImageProvider(mongoClient);

        const matchedCount = imgProvider.updateImageName(imageId, name);

        matchedCount.then((matchedCount) => {
            if (matchedCount == 0) {
                res.status(404).send({
                    error: "Not found",
                    message: "Image does not exist"
                });
            }
        })

        console.log(`Image ID: ${imageId}, New Name: ${name}`);
    })
}