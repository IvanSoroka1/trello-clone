import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import  NameAndInput  from "../components/NameAndInput";

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Login Attempt', email, password)
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
                credentials:"include"
            })

            if (!response.ok) {
                setLoginError(true);
            }
            else{
                console.log("Login successful: ");
                navigate("/dashboard");
            }

            

        }
        catch (err) {
            console.error("Login error: ", err);
        }
    };


    return (
        <div className="flex flex-col justify-center min-h-screen items-center">
            <div className="text-6xl text-bold mb-16">
                Task Managing App
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col">
                <NameAndInput type="email" name="Email" value={email} setter={setEmail} />

                <NameAndInput type="password" name="Password" value={password} setter={setPassword} />
                <div>
                    {loginError && <p className="text-red-500">Invalid Username or Password</p>}
                </div>
                <div className="flex mt-6">
                    <button className="border rounded hover:bg-gray-100 transition-colors duration-200 cursor-pointer px-4">
                        Login
                    </button>
                </div>
                <div className="mt-12">
                    Don't have an account?{' '}
                    {/* <Link to="/register" className="ml-2 border rounded hover:bg-gray-100 transition-colors duration-200 cursor-pointer px-4"> */}
                    <Link to="/register" className="underline">
                        Register
                    </Link>
                </div>
            </form>
        </div>
    )
}

export default Login