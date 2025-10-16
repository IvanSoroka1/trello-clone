import { useState } from "react";
import { fetchWithRefresh } from "../../Refresh";
import { Link, useNavigate } from "react-router-dom";
import { emailRegex } from "../../utilities/EmailRegex.tsx";
import InputsCard, { AppName } from "../InputsCard.tsx";

function EnterEmail() {
    enum MessageType {
        none,
        success,
        invalidFormat,
        nonExistantEmail
    }

    const [email, setEmail] = useState('');
    const [displayMessage, setDisplayMessage] = useState<MessageType>(MessageType.none);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!emailRegex.test(email)) {
            setDisplayMessage(MessageType.invalidFormat);
            return;
        }

        const response = await fetchWithRefresh(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: email }),
        }, navigate)
        if (response.ok)
            setDisplayMessage(MessageType.success);
        else // if the email isn't recognized
            setDisplayMessage(MessageType.nonExistantEmail);
    }

    return (
        <InputsCard>
            <AppName />
            {displayMessage === MessageType.success ? (
                <div className="text-center">
                    <p>A recovery link has been sent to:</p>
                    <p className="font-bold ">{email}</p>

                    {email.endsWith("gmail.com") && (
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://mail.google.com"
                            className="mt-4 block text-center text-white bg-blue-500 rounded-lg hover:bg-blue-400 transition-colors duration-200 cursor-pointer p-2 w-full mt-2"
                        >
                            Open Email
                        </a>
                    )}
                <Link className= "block mt-4 text-blue-500 underline " to="/">Return to Login</Link>
                </div>

            ) : (
                <div>
                <div className="font-bold py-2 text-center">Enter Your Email</div>
                    <input
                        type="email"
                        value={email}
                        className="border border-gray-200 rounded-lg bg-white p-2 w-full mb-2"
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                    />
                    <button
                        onClick={handleSubmit}
                        className="border rounded bg-blue-500 text-white p-2 w-full hover:bg-blue-600 rounded-lg cursor-pointer"
                    >
                        Send Recovery Link
                    </button>

                    {displayMessage === MessageType.invalidFormat && (
                        <div className="text-red-500">Error: Invalid email format</div>
                    )}
                    {displayMessage === MessageType.nonExistantEmail && (
                        <div className="text-red-500">Error: No account with this email exists</div>
                    )}
                </div>
            )}
        </InputsCard>

    )
}

export default EnterEmail;