import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { fetchWithRefresh } from "../Refresh.tsx";
import { Clipboard } from "lucide-react";

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Login Attempt', email, password)
        try {
            const response = await fetchWithRefresh(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
                credentials: "include"
            }, navigate)
            const data = await response.json();
            if (data.message) {
                setLoginError(data.message);
            } else {
                navigate("/dashboard");
            }

        }
        catch (err) {
            console.error("Login error: ", err);
        }
    };

    useEffect(() => {
        try {
            const response = fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
                method: "GET",
                credentials: "include"
            });
            response.then(async (res) => {
                const data = await res.json();
                if (data.email) {
                    navigate("/dashboard");
                }
                else {
                    setLoading(false);
                }
            })
        } catch (e) {
            console.log("Error: ", e);
        }
    });

    return (
        (loading ? <div className="flex justify-center items-center min-h-screen text-4xl">Loading...</div> :
            <div className="flex flex-col justify-center min-h-screen items-center bg-hero">
                <div className="shadow-lg flex flex-col justify-center items-center p-12 rounded-lg bg-white w-1/4">
                    <Clipboard className="w-1/3 h-1/3 text-blue-500 mx-auto mb-4" />
                    <div className="text-4xl text-center font-semibold">
                        Task Managing App
                    </div>
                    <div className="text-1xl text-gray-500 text-center py-2">
                        Stay organized and on top of tasks
                    </div>
                        <input
                            type={"email"}
                            value={email}
                            className="border border-gray-200 rounded-lg bg-white p-2 w-full mb-2"
                            onChange={(e) => { setEmail(e.target.value) }}
                            placeholder="Email"
                        >
                        </input>
                        <input
                            type={"password"}
                            value={password}
                            className="border border-gray-200 rounded-lg bg-white p-2 w-full mb-2"
                            onChange={(e) => { setPassword(e.target.value) }}
                            placeholder="Password"
                        >
                        </input>

                    {loginError && (
                        <p className="text-red-500 whitespace-normal break-words">
                            {loginError}
                        </p>
                    )}
                    <button onClick={handleSubmit} className="text-white bg-blue-500 rounded-lg hover:bg-blue-400 transition-colors duration-200 cursor-pointer p-2 w-full">
                        Login
                    </button>
                    <div className="text-gray-500 mt-12">
                        Don't have an account?{' '}
                        {/* <Link to="/register" className="ml-2 border rounded hover:bg-gray-100 transition-colors duration-200 cursor-pointer px-4"> */}
                        <Link to="/register" className="underline">
                            Register
                        </Link>
                    </div>
                    <div className="text-gray-500 mt-2">
                        <Link to="/forgot-password" className="underline">
                            Forgot Password?
                        </Link>
                    </div>
                </div>
            </div>
        )
    )
}

export default Login