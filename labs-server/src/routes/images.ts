import express, { Request, Response } from "express";
import { MongoClient } from "mongodb";
import { ImageProvider } from "../ImageProvider";
import {handleImageFileErrors, imageMiddlewareFactory} from "../imageUploadMiddleware";

export function registerImageRoutes(app: express.Application, mongoClient: MongoClient) {

    app.get("/api/images", (req: Request, res: Response) => {
        const imgProvider = new ImageProvider(mongoClient);
        let userId: string | undefined = undefined;
        if (typeof req.query.createdBy === "string") {
            userId = req.query.createdBy;
        }
        // console.log(`query param: ${userId}`);

        const images = imgProvider.getAllImages(userId);

        images.then((images) => {
            return res.status(200).json(images);
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

    app.post(
        "/api/images",
        imageMiddlewareFactory.single("image"),
        handleImageFileErrors,
        async (req: Request, res: Response) => {
            // Final handler function after the above two middleware functions finish running
            const file = req.file;
            const userFileName = req.body.name;
            const user = res.locals.token;


            if (!file || !userFileName) {
                res.status(400).send({
                    error: "Bad request",
                    message: "Missing file or file name"
                })
                return;
            }
            const imageId = file.filename;
            console.log(`auth stuff: ${res.locals.token}`);

            const newImageDocument = {
                _id: imageId,
                src: `/uploads/${imageId}`,
                name: userFileName,
                likes: 0,
                author: user?.username,
            }
            const imgProvider = new ImageProvider(mongoClient);
            const result = imgProvider.createImage(newImageDocument);

            res.status(201).send(newImageDocument);
        }
    )
}