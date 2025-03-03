import { MongoClient, ObjectId } from "mongodb";

interface ImageDocument {
    _id: ObjectId;
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

    async getAllImages(): Promise<(ImageDocument & { author: Author })[]> { // TODO #2
        console.log("Get all images");
        const collectionName = process.env.IMAGES_COLLECTION_NAME;
        const usersCollectionName = process.env.USERS_COLLECTION_NAME;
        if (!collectionName || !usersCollectionName) {
            throw new Error("Missing IMAGES_COLLECTION_NAME from environment variables");
        }

        const collection = this.mongoClient.db().collection<ImageDocument>(collectionName); // TODO #1

        const denormalizedImages = await collection.aggregate([
            {
                $lookup: {
                    from: usersCollectionName,
                    localField: "author",  // The field in 'images' collection
                    foreignField: "_id",   // The field in 'authors' collection
                    as: "author"
                }
            },
            {
                $unwind: { path: "$author", preserveNullAndEmptyArrays: true }
            },
        ]).toArray();

        console.log("Denormalized Image Documents:", denormalizedImages);
        return denormalizedImages as (ImageDocument & {author: Author})[]; // Without any options, will by default get all documents in the collection as an array.
    }
}