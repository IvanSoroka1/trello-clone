import { useEffect, useState } from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {fetchWithRefresh} from "../../Refresh.tsx";


export default function ElipsesMenuButton({ id }: { id: number }) {
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false)
    const [confirmDeleteMenu, setConfirmDeleteMenu] = useState(false);
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
            <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }} className="rounded p-1">
                <FiMoreHorizontal size={20} />
            </button>
            {
                showMenu &&
                <div className="w-80 absolute top-full right-0 shadow-lg rounded-lg bg-white w-32">
                    <div className="flex justify-center font-bold">
                        Board Options
                    </div>
                    <div className="py-2">
                        <button onClick={() => { setConfirmDeleteMenu(true) }} className="flex justify-start text-red-500 w-full">
                            Delete Board
                        </button>
                    </div>
                </div>
            }

            {
                confirmDeleteMenu &&
                <div className="z-5 fixed inset-0 bg-[#00000080]  flex justify-center items-center">
                    <div className="relative w-1/3 h-1/2 text-4xl bg-white rounded text-center p-6">
                        Are you sure you want to delete this board? This action cannot be undone.

                        <div onClick={deleteBoard} className="w-1/3 absolute bottom-6 left-12 bg-green-500 text-white hover:bg-green-700">
                            Yes
                        </div>
                        <div onClick={() => setConfirmDeleteMenu(false)}className="w-1/3 absolute bottom-6 right-12 bg-red-500 text-white hover:bg-red-700">
                            No
                        </div>
                    </div>

                </div>
            }
        </div>

    );
}