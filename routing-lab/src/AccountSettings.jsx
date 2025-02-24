import { MainLayout } from "./MainLayout.jsx";

export function AccountSettings(props) {
    return (
        <>
            <h2>Account settings</h2>
            <label>
                Username <input onChange={(e) => {props.setUserName(e.target.value)}} />
            </label>
            <p><i>Changes are auto-saved.</i></p>
        </>
    );
}
