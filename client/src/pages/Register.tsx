import { useState } from "react";
import NameAndInput from "../components/NameAndInput";

function Register() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Attempting to register with the following email: ", email);
        if(password != confirmPassword)
            return; 
        if(!emailRegex.test(email))
            return;

        try {

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`,
                {
                   method: "POST",
                   headers: {
                         "Content-Type": "application/json",
                   }, 
                   body: JSON.stringify({
                    Password: password,
                    Email: email
                   })
                }
            );

            // const response = await fetch(`${import.meta.env.VITE_API_URL}/api/email/send`,
            //     {
            //         method: "POST",
            //         headers: {
            //             "Content-Type": "application/json",
            //         },
            //         body: JSON.stringify({
            //             To: email
            //         })
            //     }
            // );
            if(!response.ok)
                console.log("Registration Failed");
            else
                console.log("Registration successful");
        } catch (err) {
            console.log("Registration error: ", err);
        }

    }

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    return (
        <div className="flex min-h-screen justify-center items-center">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <NameAndInput type="email" name="Email" value={email} setter={setEmail} />
                {
                    (!emailRegex.test(email)) && (email != '') && 
                    <div className="text-red-500">Error, invalid email!</div>
                }
                <NameAndInput type="password" name="Password" value={password} setter={setPassword} />
                <NameAndInput type="password" name="Retype Password" value={confirmPassword} setter={setConfirmPassword} />
                {(password != confirmPassword) && (confirmPassword!= '') && (password != '') && 
                   <div className="text-red-500">Error, passwords don't match!</div> }
                <button className="border rounded hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                    Register
                </button>
            </form>
        </div>
    )
}

// function NameAndInput({name, value, setter, type} : {name:string, value:string, setter: React.Dispatch<React.SetStateAction<string>>, type:string}){

//     return (
//         <div className="flex flex-col">
//             {name}
//             <input
//                 type={type}
//                 value={value}
//                 className="border rounded bg-white px-1"
//                 onChange={(e) => { setter(e.target.value) }}
//             >
//             </input>
//         </div>
//     );
// }
export default Register