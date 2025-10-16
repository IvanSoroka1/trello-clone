import { useEffect, useState } from "react";
import { fetchWithRefresh } from "../../Refresh";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FaExclamationTriangle } from "react-icons/fa";
import InputsCard, { AppName } from "../InputsCard";
import { CheckCircleIcon } from "lucide-react";

export default function ResetPassword() {
    const [newPassword, setNewPassword] = useState('');
    const [passwordMismatch, setPasswordMismatch] = useState(false);
    const [displaySuccessMessage, setDisplaySuccessMessage] = useState(false);
    const [invalidTokenError, setInvalidTokenError] = useState(false)
    const [confirmPassword, setConfirmPassword] = useState('');
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const navigate = useNavigate();
    const resetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword)
            setPasswordMismatch(true);
        else {
            const response = await fetchWithRefresh(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ NewPassword: newPassword, Token: token }),
            }, navigate)
            if (response.ok)
                setDisplaySuccessMessage(true);
            else
                setInvalidTokenError(true);
        }
    }
    useEffect(() => {
        const verifyToken = async () => {
            try {
                const response = await fetchWithRefresh(
                    `${import.meta.env.VITE_API_URL}/api/auth/verify-token`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ Token: token }),
                    },
                    navigate
                );
                if (!response.ok) {
                    setInvalidTokenError(true);
                }
            } catch (error) {
                console.error("Error verifying token:", error);
                setInvalidTokenError(true);
            }
        };

        verifyToken();
    }, [token, navigate]);

    return (
        <InputsCard>
            {displaySuccessMessage ?
                <div className="text-center flex flex-col items-center gap-4">
                    <CheckCircleIcon className="w-24 h-24 text-green-500" />
                    <div className="font-bold text-xl">Password reset successfully!</div>
                    <button className="w-full text-white bg-blue-500 rounded-lg cursor-pointer p-2" onClick={() => navigate("/")}>Login</button>
                </div>

                : invalidTokenError ?

                    <div className=" text-center flex flex-col items-center">
                        <FaExclamationTriangle className="w-16 h-16 text-red-500" />
                        <p className="font-bold text-xl"> This link is either invalid or expired!</p>
                        <p className="text-gray-500 py-2">Please request a new link.</p>
                        <Link to="/forgot-password" className="bg-blue-500 text-white p-2 rounded-lg w-full cursor-pointer">Reset Password</Link>
                    </div>

                    :
                    <div>
                        <AppName />
                        <div className="flex flex-col items-center">
                            <div className="font-bold pb-4"> Reset Your Password</div>
                            <input
                                type={"password"}
                                value={newPassword}
                                className="border border-gray-200 rounded-lg bg-white p-2 w-full mb-2"
                                onChange={(e) => { setNewPassword(e.target.value) }}
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
                            <button onClick={resetPassword} className="bg-blue-500 text-white p-2 rounded-lg w-full cursor-pointer">
                                Reset Password
                            </button>
                            {passwordMismatch && <div className="text-red-500">Error, passwords don't match!</div>}
                        </div>
                    </div>

            }
        </InputsCard>
    )
}