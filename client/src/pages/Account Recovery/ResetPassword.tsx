import NameAndInput from "../../components/NameAndInput";
import { useState } from "react";
import { fetchWithRefresh } from "../../Refresh";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function ResetPassword() {
    const [newPassword, setNewPassword] = useState('');
    const [passwordMismatch, setPasswordMismatch] = useState(false);
    const [displaySuccessMessage, setDisplaySuccessMessage] = useState(false);
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
        }
    }
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div  className="flex flex-col gap-4">
                {displaySuccessMessage ? 
                (<div className="flex flex-col items-center gap-4 text-2xl">
                    <div>Password reset successfully!</div>
                    <button className="border rounded cursor-pointer p-2" onClick = {() => navigate("/")}>Login</button>
                </div>)
                 :
                    <div className="flex flex-col gap-4">
                        <NameAndInput type="password" name="New Password" value={newPassword} setter={setNewPassword} />
                        <NameAndInput type="password" name="Confirm Password" value={confirmPassword} setter={setConfirmPassword} />
                        {passwordMismatch && <div className="text-red-500">Error, passwords don't match!</div>}
                        <button onClick={resetPassword} className="border rounded cursor-pointer">
                            Reset Password
                        </button>
                    </div>
                }
            </div >
        </div >
    )
}