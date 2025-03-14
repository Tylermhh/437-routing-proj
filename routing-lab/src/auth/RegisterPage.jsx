import UsernamePasswordForm from "./UsernamePasswordForm.jsx";
import {sendPostRequest} from "./sendPostRequest.js";
import {useNavigate} from "react-router";

export default function RegisterPage(props) {
    const navigate = useNavigate();
    async function handleSubmit(name, password) {
        console.log("inside handle register submit")
        const payload = {
            name: name,
            password: password,
        }
        const response = await sendPostRequest("/auth/register", payload);
            if (response.status === 400) {
                console.log("400 response");
                return {
                    type: "error",
                    message: `Submission Failed: Username already taken.`,
                };
            }
            if (response.status === 500) {
                return {
                    type: "error",
                    message: `Submission Failed: Internal Server Error: ${response.status}`,
                }
            }
            if (response.status === 201) {
                try {
                    const parsedResponse = await response.json();
                    console.log("response token: ", parsedResponse.token);
                    props.setAuthToken(parsedResponse.token);
                    navigate('/');
                } catch (error) {
                    console.log(`Error parsing response token: ${error}`);
                }

            }
    }
    return (
        <>
            <h1>Register A New Account</h1>
            <UsernamePasswordForm onSubmit={handleSubmit} />
        </>
    )
}