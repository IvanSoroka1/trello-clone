import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiUser } from "react-icons/fi";
import { fetchWithRefresh } from "../Refresh";
import { useNavigate } from "react-router-dom";

export default function UserButton() {
    const navigate = useNavigate();

    const logOut = async () => {
        const response = await fetchWithRefresh(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
            method: "GET",
            credentials: "include"
        }, navigate);
        if (!response.ok)
            throw Error("bad request");
        window.location.href = "/";
    }

    const [userEmail, setUserEmail] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
            const response = await fetchWithRefresh(
                `${import.meta.env.VITE_API_URL}/api/auth/me`,
                { credentials: "include" },
                navigate
            );
            if (response.ok) {
                const data = await response.json();
                setUserEmail(data.email);
            }
        };
        fetchUser();
    }, []);

    // nearly everything below is almost directly copied from ElipsesMenuButton with minor differences. This may be refactored.
    const [showMenu, setShowMenu] = useState(false);
    const [position, setPosition] = useState<{ top: number; right: number }>({ top: 0, right: 0 });

    useEffect(() => {
        const closeMenu = () => {
            setShowMenu(false);
        };
        if (showMenu !== null) {
            document.addEventListener("click", closeMenu);
        }
        return () => { document.removeEventListener("click", closeMenu); };
    }, [showMenu])


    return (
        <div>
            <div>
                <button onClick={(e) => {
                    e.stopPropagation(); setShowMenu(!showMenu); const rect = e.currentTarget.getBoundingClientRect();
                    setPosition({
                        top: rect.bottom, // below button
                        right: window.innerWidth - rect.right,  // aligned to right
                    });
                }} className="rounded p-1">
                    <FiUser size={20} />
                </button>
                {
                    showMenu &&
                    createPortal(
                        <div className="z-50 w-80 shadow-lg rounded-lg bg-white w-32"
                            style={{
                                top: position.top,
                                right: position.right,
                                position: "fixed",
                            }}>
                            <div className="flex justify-center font-bold">
                                {userEmail}
                            </div>
                            <div className="py-2">
                                <button onClick={logOut} className="flex justify-start text-red-500 w-full">
                                    Log Out
                                </button>
                            </div>
                        </div>
                        , document.body)
                }
            </div>

        </div>
    );

}
