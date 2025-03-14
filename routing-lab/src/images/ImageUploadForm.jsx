import {useActionState, useId, useState} from "react";


export function ImageUploadForm(props) {
    const id = useId();
    const [dataUrl, setDataUrl] = useState();
    const [result, submitAction, isPending] = useActionState(
        async (previousState, formData) => {
            const name = formData.get("name");
            const image = formData.get("image");

            if (!name || !image) {
                return {
                    type: "error",
                    message: `Please upload an image and its name.`,
                };
            }

            try {
                console.log("Making post request...");
                const response = await fetch("/api/images", {
                    method: "POST",
                    body: formData,
                    headers: {
                        "Authorization": `Bearer ${props.authToken}`
                    }
                });
                setDataUrl(null);
                if (!response.ok) {
                    // Handle HTTP 400 bad upload, HTTP 401 Unauthorized, etc...
                    if (response.status === 400) {
                        return {
                            type: "error",
                            message: `Bad Upload.`,
                        };
                    }

                    if (response.status === 401) {
                        return {
                            type: "error",
                            message: `Unauthorized access token.`,
                        };
                    }

                    if (response.status === 500) {
                        return {
                            type: "error",
                            message: `Internal Server Error. Please try again later.`,
                        };
                    }

                }
                if (response.status === 201) {
                    return {
                        type: "success",
                        message: `Successfully uploaded.`,
                    };
                }

            } catch (error) { // Network error
                console.error(error);
                return {
                    type: "error",
                    message: `Network Error. Please try again later.`,
                };
            }
        },
        null
    );

    function readAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const fr = new FileReader();
            fr.onload = () => resolve(fr.result);
            fr.onerror = (err) => reject(err);
            fr.readAsDataURL(file);
        });
    }

    function handleFileSelected(e) {
        const inputElement = e.target;
        const fileObj = inputElement.files[0];
        const newDataURL = readAsDataURL(fileObj);
        newDataURL.then(data => {
            setDataUrl(data)
        })
    }

    return (
        <>
            {result && <p className={`${result.type}`}>{result.message}</p>}
            {isPending && <p className="message loading">Loading ...</p>}
            <form action={submitAction} >
                <div>
                    <label htmlFor={id}>Choose image to upload: </label>
                    <input
                        id={id}
                        name="image"
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        onChange={handleFileSelected}
                    />
                </div>
                <div>
                    <label>
                        <span>Image title: </span>
                        <input name="name" />
                    </label>
                </div>

                <div> {/* Preview img element */}
                    <img style={{maxWidth: "20em"}} src={dataUrl} alt="" />
                </div>

                <button>Confirm upload</button>
            </form>
        </>
    );
}