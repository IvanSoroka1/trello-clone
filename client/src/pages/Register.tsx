import {fetchWithRefresh} from "../Refresh.tsx";
import { useState } from "react";
import { IoMailUnreadOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import {emailRegex} from "../utilities/EmailRegex.tsx";
import InputsCard, {AppName} from "./InputsCard.tsx";

function Register() {
    const [usedEmail, setUsedEmail] = useState(false);
    const [showMessage, setShowMessage] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Attempting to register with the following email: ", email);
        if (!emailRegex.test(email))
        { 
            setEmailError(true);
            return;
        }
        if (password != confirmPassword)
        { 
            setPasswordError(true);
            return;
        }
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

    return (
        !showMessage ? (
                <InputsCard>
                <AppName/>
                <div className="font-bold py-2">Register Your Account</div>
                    <input
                        type={"email"}
                        value={email}
                        className="border border-gray-200 rounded-lg bg-white p-2 w-full mb-2"
                        onChange={(e) => { setEmail(e.target.value) }}
                        placeholder="Email"
                    ></input>
                    <input
                            type={"password"}
                            value={password}
                            className="border border-gray-200 rounded-lg bg-white p-2 w-full mb-2"
                            onChange={(e) => { setPassword(e.target.value) }}
                            placeholder="Password"
                        >
                    </input>
                    <input
                            type={"password"}
                            value={confirmPassword}
                            className="border border-gray-200 rounded-lg bg-white p-2 w-full mb-2"
                            onChange={(e) => { setConfirmPassword(e.target.value) }}
                            placeholder="Confirm Password"
                        >
                    </input>
                    <button onClick={handleSubmit} className="text-white bg-blue-500 rounded-lg hover:bg-blue-400 transition-colors duration-200 cursor-pointer p-2 w-full mt-2">
                        Register
                    </button>
                    {
                        emailError &&
                        <div className="text-red-500">Error, invalid email!</div>
                    }
                    {
                        passwordError &&
                        <div className="text-red-500">Error, passwords don't match!</div>}
                    {
                        usedEmail &&
                        <div className="text-red-500">Error, email already in use!</div>
                    }

                </InputsCard>
            )
            : 
            (
            <InputsCard>
                <IoMailUnreadOutline size={100} className="text-blue-500"/>
                <div className="font-bold text-2xl"> Check your email</div>
                We sent a verfication link to:
                <div className="font-bold">{email}</div>
                {email.endsWith("gmail.com") && 
                <a target="_blank" 
                rel="noopener noreferrer" 
                href="https://mail.google.com" className="text-center text-white bg-blue-500 rounded-lg hover:bg-blue-400 transition-colors duration-200 cursor-pointer p-2 w-full mt-2" > Open Email</a>
                }
            </InputsCard>
            )
    );
}
export default Register