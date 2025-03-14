import UsernamePasswordForm from "./UsernamePasswordForm.jsx";
import {Link, useNavigate} from "react-router";
import {sendPostRequest} from "./sendPostRequest.js";

export default function LoginPage(props) {
    const navigate = useNavigate();
    async function handleSubmit(name, password) {
        const payload = {
            name: name,
            password: password,
        }
        const response = await sendPostRequest("/auth/login", payload);
        if (response.status === 401) {
            console.log("401 response: Username or Password incorrect");
            return {
                type: "error",
                message: `Submission Failed: Invalid credentials.`,
            };
        }
        if (response.status === 500) {
            console.log("500 response: Internal Server Error");
            return {
                type: "error",
                message: `Submission Failed: Internal Server Error. Please try again later.`,
            };
        }

        if (response.status === 200) {
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
            <h1>Login</h1>
            <UsernamePasswordForm onSubmit={handleSubmit} />
            <p>Don&#39;t have an account? <Link to="/register">Register Here</Link></p>
        </>
    )
}