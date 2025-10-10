import {fetchWithRefresh} from "../Refresh.tsx";
import { useState } from "react";
import { IoMailUnreadOutline } from "react-icons/io5";
import NameAndInput from "../components/NameAndInput.tsx";
import { useNavigate } from "react-router-dom";
import {emailRegex} from "../utilities/EmailRegex.tsx";

function Register() {
    const [usedEmail, setUsedEmail] = useState(false);
    const [showMessage, setShowMessage] = useState(false);
    const navigate = useNavigate();
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Attempting to register with the following email: ", email);
        if (password != confirmPassword)
            return;
        if (!emailRegex.test(email))
            return;
        try {

            const response = await fetchWithRefresh(`${import.meta.env.VITE_API_URL}/api/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        Password: password,
                        Email: email
                    })
                }, navigate
            );
            const data = await response.json();
            if (data.message == "EMAIL_EXISTS")
                setUsedEmail(true);
            else if (!response.ok)
                throw Error();
            else
                setShowMessage(true);
        } catch (err) {
            console.log("Registration error: ", err);
        }


    }

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    return (
        !showMessage ? (
            <div className="flex min-h-screen justify-center items-center">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <NameAndInput type="new-email" name="Email" value={email} setter={setEmail} />
                    {
                        (!emailRegex.test(email)) && (email != '') &&
                        <div className="text-red-500">Error, invalid email!</div>
                    }
                    <NameAndInput type="password" name="Password" value={password} setter={setPassword} />
                    <NameAndInput type="password" name="Retype Password" value={confirmPassword} setter={setConfirmPassword} />
                    {(password != confirmPassword) && (confirmPassword != '') && (password != '') &&
                        <div className="text-red-500">Error, passwords don't match!</div>}
                    {
                        (usedEmail) &&
                        <div className="text-red-500">Error, email already in use!</div>
                    }
                    <button className="border rounded hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                        Register
                    </button>
                </form>
            </div>)
            : (<div className="flex gap-8 min-h-screen items-center justify-center">

                <IoMailUnreadOutline size={100} />
                <h1 className="w-1/2 text-4xl">
                    We have sent an email to {email}. Please check your inbox to verify your account.
                </h1>
            </div>)
    );
}
export default Register