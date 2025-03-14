import { Homepage } from "./Homepage";
import { AccountSettings } from "./AccountSettings";
import { ImageGallery } from "./images/ImageGallery.jsx";
import {Route, Routes} from "react-router";
import {ImageDetails} from "./images/ImageDetails.jsx";
import {useState} from "react";
import {MainLayout} from "./MainLayout.jsx";
import {useImageFetching} from "./images/useImageFetching.js";
import RegisterPage from "./auth/RegisterPage.jsx";
import LoginPage from "./auth/LoginPage.jsx";
import {ProtectedRoute} from "./auth/ProtectedRoute.jsx";


function App() {
    const [ userName, setUserName ] = useState(" ");
    const [ authToken, setAuthToken ] = useState("");

    const { isLoading, fetchedImages } = useImageFetching("", authToken);
    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>

                    <Route index element={
                        <ProtectedRoute authToken={authToken} >
                            <Homepage userName={userName} />
                        </ProtectedRoute>}
                    />
                    <Route path="account" element={
                        <ProtectedRoute authToken={authToken} >
                            <AccountSettings setUserName={setUserName} />
                        </ProtectedRoute>}
                    />
                    <Route path="images" element={
                        <ProtectedRoute authToken={authToken} >
                            <ImageGallery isLoading={isLoading} fetchedImages={fetchedImages} authToken={authToken} />
                        </ProtectedRoute>
                        }
                    />
                    <Route path="images/:imageId" element={
                        <ProtectedRoute authToken={authToken} >
                            <ImageDetails />
                        </ProtectedRoute>}
                    />

                <Route path="register" element={<RegisterPage setAuthToken={setAuthToken} />} />
                <Route path="login" element={<LoginPage setAuthToken={setAuthToken} />} />
            </Route>
        </Routes>
    )
}

export default App
