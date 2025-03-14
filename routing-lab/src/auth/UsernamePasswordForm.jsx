import {useActionState} from "react";
import "./UsernamePasswordForm.css";

export default function UsernamePasswordForm(props) {
    const [result, submitAction, isPending] = useActionState(
        async (previousState, formData) => {
            const name = formData.get("name");
            const password = formData.get("password");

            if (!name || !password) {
                return {
                    type: "error",
                    message: `Please fill in your name and password.`,
                };
            }

            // eslint-disable-next-line react/prop-types
            const submitResult = await props.onSubmit(name, password)
            console.log(submitResult);

            return submitResult;
            // return {
            //     type: "success",
            //     message: `You have succesfully submitted!`,
            // };
        },
        null
    );

    return (
        <>
            {result && <p className={`${result.type}`}>{result.message}</p>}
            {isPending && <p className="message loading">Loading ...</p>}
            <form action={submitAction}>
                <div>
                    <label htmlFor="name">Name</label>
                    <input type="text" id="name" name="name" disabled={isPending} />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" name="password" disabled={isPending} />
                </div>
                <div>
                    <button type="submit" disabled={isPending}>Submit</button>
                </div>
            </form>
        </>
    );
}