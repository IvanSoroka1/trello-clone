import { useEffect, useState } from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { fetchWithRefresh } from "../../Refresh.tsx";
import { createPortal } from "react-dom";


export default function ElipsesMenuButton({ id }: { id: number }) {
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false)
    const [confirmDeleteMenu, setConfirmDeleteMenu] = useState(false);
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

    const deleteBoard = async () => {
        try {
            const response = await fetchWithRefresh(`${import.meta.env.VITE_API_URL}/api/dashboard/board`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    BoardId: id
                }),
                credentials: "include"
            }, navigate);

            if (!response.ok)
                throw Error("bad request");
            navigate("/dashboard");

        } catch (e) {
            console.log("Error: ", e);
        }
    };

    return (
        <div>
            <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); const rect = e.currentTarget.getBoundingClientRect();
             setPosition({
                top: rect.bottom, // below button
                right: window.innerWidth - rect.right,  // aligned to right
            }); }} className="rounded p-1">
                <FiMoreHorizontal size={20} />
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
                        Board Options
                    </div>
                    <div className="py-2">
                        <button onClick={() => { setConfirmDeleteMenu(true) }} className="flex justify-start text-red-500 w-full">
                            Delete Board
                        </button>
                    </div>
                </div>
                , document.body)
            }

            {
                confirmDeleteMenu &&
                createPortal(
                    <div className="z-50 fixed inset-0 bg-[#00000080]  flex justify-center items-center">
                        <div className="relative w-1/3 h-1/2 text-4xl bg-white rounded text-center p-6">
                            Are you sure you want to delete this board? This action cannot be undone.

                            <div onClick={deleteBoard} className="w-1/3 absolute bottom-6 left-12 bg-green-500 text-white hover:bg-green-700">
                                Yes
                            </div>
                            <div onClick={() => setConfirmDeleteMenu(false)} className="w-1/3 absolute bottom-6 right-12 bg-red-500 text-white hover:bg-red-700">
                                No
                            </div>
                        </div>

                    </div>
                     , document.body
                 )
            }
        </div>

    );
}