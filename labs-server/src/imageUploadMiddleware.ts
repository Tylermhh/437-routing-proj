import { Request, Response, NextFunction } from "express";
import multer from "multer";

class ImageFormatError extends Error {}

const storageEngine = multer.diskStorage({
    destination: function (req, file, cb) {
        // TODO 1
        const imgUploadDir = process.env.IMAGE_UPLOAD_DIR;
        if (!imgUploadDir) {
            throw new Error("Missing IMAGE_UPLOAD_DIR from env file");
        }
        cb(null, imgUploadDir);
    },
    filename: function (req, file, cb) {
        // TODO 2
        const fileType = file.mimetype;
        if (fileType !== "image/png" && fileType !== "image/jpg") {
            cb(new ImageFormatError("Unsupported image type"), "");
            return;
        }
        const fileExtension = file.mimetype === "image/jpg" ? "jpg" : "png";
        const fileName = Date.now() + "-" + Math.round(Math.random() * 1E9) + "." + fileExtension;
        cb(null, fileName);
    }
});

export const imageMiddlewareFactory = multer({
    storage: storageEngine,
    limits: {
        files: 1,
        fileSize: 5 * 1024 * 1024 // 5 MB
    },
});

export function handleImageFileErrors(err: any, req: Request, res: Response, next: NextFunction) {
    if (err instanceof multer.MulterError || err instanceof ImageFormatError) {
        res.status(400).send({
            error: "Bad Request",
            message: err.message
        });
        return;
    }
    next(err); // Some other error, let the next middleware handle it
}