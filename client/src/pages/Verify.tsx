
import {fetchWithRefresh} from "../Refresh.tsx";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function Verify() {
    const [verificationStatus, setVerificationStatus] = useState("Verifying your account...");
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();
    //const verificationStatus = false;
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
                    setVerificationStatus("You have successfully verified! You may close this page");
            })
        }
        catch (e) {
            setVerificationStatus("Server error");
        }

    }, []
    );

    return (<div className="flex min-h-screen items-center justify-center text-6xl">{verificationStatus}</div>);

}

export default Verify;
