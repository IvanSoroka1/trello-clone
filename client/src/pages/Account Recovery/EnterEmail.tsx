import { useState } from "react";
import NameAndInput from "../../components/NameAndInput";
import { fetchWithRefresh } from "../../Refresh";
import { useNavigate } from "react-router-dom";
import { emailRegex } from "../../utilities/EmailRegex.tsx";

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
        <div className="flex min-h-screen items-center justify-center">
            {
                displayMessage === MessageType.success ? (
                        <div className="text-center">
                            <p>An email has been sent to {email} with a link to reset your password.</p>
                            <p>You may close this page.</p>
                        </div>
                ) :
                    <div className="flex flex-col gap-4">
                        <NameAndInput type="email" name="Email" value={email} setter={setEmail} />
                        <button onClick={handleSubmit} className="border rounded cursor-pointer">
                            Send Recovery Link
                        </button>
                        {displayMessage === MessageType.invalidFormat && <div className="text-red-500">Error: Invalid email format</div>}
                        {displayMessage === MessageType.nonExistantEmail && <div className="text-red-500">Error: No account with this email exists</div>}
                    </div>
            }
        </div>
    )
}

export default EnterEmail;