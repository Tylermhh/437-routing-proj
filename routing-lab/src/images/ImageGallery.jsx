import { MainLayout } from "../MainLayout.jsx";
import { useImageFetching } from "./useImageFetching.js";
import "./ImageGallery.css";
import {ImageUploadForm} from "./ImageUploadForm.jsx";

export function ImageGallery(props) {

    const imageElements = props.fetchedImages.map((image) => (
        <div key={image._id} className="ImageGallery-photo-container">
            <a href={"/images/" + image._id}>
                <img src={image.src} alt={image.name}/>
            </a>
        </div>
    ));
    return (
        <>
            <h2>Image Gallery</h2>
            {props.isLoading && "Loading..."}
            <div className="ImageGallery">
                {imageElements}
            </div>

            <h3>Image Upload Form</h3>
            <ImageUploadForm authToken={props.authToken} />
        </>
    );
}
