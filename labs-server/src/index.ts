import express, { Request, Response } from "express";
import dotenv from "dotenv";
import * as path from "node:path";
import { MongoClient } from "mongodb";
import {ImageProvider} from "./ImageProvider";
import { ObjectId } from "mongodb";

dotenv.config(); // Read the .env file in the current working directory, and load values into process.env.
const PORT = process.env.PORT || 3000;
const staticDir = process.env.STATIC_DIR || "public";


async function setUpServer() {
    const { MONGO_USER, MONGO_PWD, MONGO_CLUSTER, DB_NAME } = process.env;

    const connectionStringRedacted = `mongodb+srv://${MONGO_USER}:<password>@${MONGO_CLUSTER}/${DB_NAME}`;
    const connectionString = `mongodb+srv://${MONGO_USER}:${MONGO_PWD}@${MONGO_CLUSTER}/${DB_NAME}`;

    console.log("Attempting Mongo connection at " + connectionStringRedacted);

    const mongoClient = await MongoClient.connect(connectionString);

    const collectionInfos = await mongoClient.db().listCollections().toArray();
    console.log(collectionInfos.map(collectionInfo => collectionInfo.name)); // For debug only


    const app = express();
    app.use(express.static(staticDir));

    app.get("/hello", (req: Request, res: Response) => {
        res.send("Hello, World");
    });

    // version without the denormalization
    app.get("/api/images", (req: Request, res: Response) => {
        const imgProvider = new ImageProvider(mongoClient);

        const images = imgProvider.getAllImages();

        images.then((images) => {
            return res.json(images);
        }).catch((err) => {
            console.error("Error fetching images:", err);
            res.status(500).json({ error: "Internal server error" });
        })
    })

    // app.get("/api/images", (req: Request, res: Response) => {
    //     const imgProvider = new ImageProvider(mongoClient);
    //
    //     imgProvider.getAllImages()
    //         .then(async images => {
    //             console.log("Fetched images:", images); // Log the fetched images
    //             // Convert authorIds to ObjectId instances
    //             const authorIds = [...new Set(images.map(img => new ObjectId(img.author)))];
    //             console.log("Author IDs:", authorIds); // Log the author IDs
    //
    //             const authorsCollection = mongoClient.db().collection("authors");
    //
    //             try {
    //                 // Find authors with converted ObjectId
    //                 const authors = await authorsCollection.find({ _id: { $in: authorIds } }).toArray();
    //                 console.log("Fetched authors:", authors); // Log the fetched authors
    //
    //                 // Create a map of authors for fast lookup
    //                 const authorMap = new Map(authors.map(author => [author._id.toString(), author]));
    //
    //                 // Denormalize image data by adding author information
    //                 const denormalizedImages = images.map(image => ({
    //                     ...image,
    //                     author: authorMap.get(image.author.toString()) || { _id: image.author, username: "Unknown", email: "Unknown" }
    //                 }));
    //
    //                 res.json(denormalizedImages);
    //             } catch (err) {
    //                 console.error("Error fetching authors:", err);
    //                 res.status(500).json({ error: "Internal server error" });
    //             }
    //         })
    //         .catch(err => {
    //             console.error("Error fetching images:", err);
    //             res.status(500).json({ error: "Internal server error" });
    //         });
    // });


    app.get("*", (req: Request, res: Response) => {
        res.sendFile("index.html", {root: staticDir});
    });

    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

setUpServer();



