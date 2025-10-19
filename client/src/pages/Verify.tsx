
import {fetchWithRefresh} from "../Refresh.tsx";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import InputsCard from "./InputsCard.tsx";
import { CheckCircleIcon } from "lucide-react";

function Verify() {
    const [verificationStatus, setVerificationStatus] = useState("Verifying your account...");
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();
    useEffect(() => {
        try {
            fetchWithRefresh(`${import.meta.env.VITE_API_URL}/api/auth/verify`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        token: token 
                    })
                }, navigate
            ).then(async (response) => {
                const data = await response.json();
                if (!response.ok)
                    setVerificationStatus(data.message);
                else
                    setVerificationStatus("You have successfully verified your account!");
            })
        }
        catch (e) {
            setVerificationStatus("Server error");
        }

    }, []
    );

    return (
    <InputsCard>
    <div className="flex flex-col justify-center items-center gap-4">
        <CheckCircleIcon className="w-24 h-24 text-green-500 py-2" />
        <div className="text-center text-lg font-bold py-2">
            {verificationStatus}
        </div>
        <button className="w-full text-white bg-blue-500 rounded-lg cursor-pointer p-2 mt-4" onClick={() => navigate("/")}>Login</button>
    </div>
    </InputsCard>
);
}

export default Verify;
