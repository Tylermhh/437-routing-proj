import { Homepage } from "./Homepage";
import { AccountSettings } from "./AccountSettings";
import { ImageGallery } from "./images/ImageGallery.jsx";
import {Route, Routes} from "react-router";
import {ImageDetails} from "./images/ImageDetails.jsx";
import {useState} from "react";
import {MainLayout} from "./MainLayout.jsx";
import {useImageFetching} from "./images/useImageFetching.js";


function App() {
    const [ userName, setUserName ] = useState(" ");

    const { isLoading, fetchedImages } = useImageFetching("");
    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route index element={<Homepage userName={userName} />} />
                <Route path="account" element={<AccountSettings setUserName={setUserName} />} />
                <Route path="images" element={<ImageGallery isLoading={isLoading} fetchedImages={fetchedImages} />} />
                <Route path="images/:imageId" element={<ImageDetails />} />
            </Route>
        </Routes>
    )
}

export default App
