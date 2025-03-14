import {MongoClient} from "mongodb";

interface ImageDocument {
    _id: string;
    src: string;
    name: string;
    author: string;
    likes: number;
}

interface Author {
    _id: string;
    username: string;
    email: string;
}

export class ImageProvider {
    constructor(private readonly mongoClient: MongoClient) {}

    async getAllImages(authorID?: string): Promise<ImageDocument[]> {
        const collectionName = process.env.IMAGES_COLLECTION_NAME;
        const usersCollectionName = process.env.USERS_COLLECTION_NAME;
        if (!collectionName || !usersCollectionName) {
            throw new Error("Missing IMAGES_COLLECTION_NAME or USERS_COLLECTION_NAME from environment variables");
        }

        const collection = this.mongoClient.db().collection<ImageDocument>(collectionName);

        // // Build aggregation pipeline
        // const pipeline: any[] = [
        //     {
        //         $lookup: {
        //             from: usersCollectionName,
        //             localField: "author",  // The field in 'images' collection
        //             foreignField: "_id",   // The field in 'users' collection
        //             as: "author"
        //         }
        //     },
        //     {
        //         $unwind: { path: "$author", preserveNullAndEmptyArrays: true }
        //     }
        // ];
        //
        // // Conditionally filter by authorID if it's provided
        // if (authorID) {
        //     pipeline.unshift({ $match: { author: authorID } }); // Add $match at the start
        // }
        //
        // const denormalizedImages = await collection.aggregate(pipeline).toArray();

        const query: any = authorID ? { author: authorID } : {};

        // Fetch and return images directly from the collection (normalized)
        return await collection.find(query).toArray();
    }

    async updateImageName(imageId: string, newName: string): Promise<number> {
        const collectionName = process.env.IMAGES_COLLECTION_NAME;
        if (!collectionName) {
            throw new Error("Missing IMAGES_COLLECTION_NAME from environment variables");
        }

        const collection = this.mongoClient.db().collection<ImageDocument>(collectionName);
        const result = await collection.updateOne(
            {_id: imageId},
            {$set: {name: newName}}
        );

        return result.matchedCount;
    }

    async createImage(newImage: ImageDocument) {
        const collectionName = process.env.IMAGES_COLLECTION_NAME;
        if (!collectionName) {
            throw new Error("Missing IMAGES_COLLECTION_NAME from environment variables");
        }

        const collection = this.mongoClient.db().collection<ImageDocument>(collectionName);
        const result = await collection.insertOne(newImage);
    }

}