import { fetchWithRefresh } from "../Refresh.tsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import NameAndInput from "../components/NameAndInput.tsx";
import UserButton from "../components/UserButton.tsx";

interface Board {
    id: number,
    title: string,
    date: Date
}

export default function Dashboard() {
    const [boards, setBoards] = useState<Board[]>([])
    const navigate = useNavigate();

    useEffect(() => {
        try {
            fetchWithRefresh(`${import.meta.env.VITE_API_URL}/api/dashboard/boards`,
                {
                    method: "GET",
                    credentials: "include"
                }, navigate
            ).then(async response => {
                if (!response.ok && response.status !== 401) {
                    navigate("/");
                    return;
                }
                const data = await response.json();
                setBoards(data.message);


                console.log("Success! JSON response: ", data);
            })
        }
        catch (e) {
            console.log("Error: ", e);
        }
    }, []);

    const [popup, setPopup] = useState(false);
    const [name, setName] = useState("");

    const createBoard = async () => {
        try {
            const response = await fetchWithRefresh(`${import.meta.env.VITE_API_URL}/api/dashboard/board`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    Title: name
                }),
                credentials: "include"
            }, navigate);

            const data = await response.json();
            if (!response.ok)
                throw Error("bad request");
            navigate(`/board/${data.id}`, { state: { boardName: data.title } });

        } catch (e) {
            console.log("Error: ", e);
        }
    };

    return (
        <div>
            <div className="flex justify-center py-2 text-4xl border-b-2">
                My boards
                <div className="absolute right-2">
                    <UserButton></UserButton>
                </div>
            </div>
            <div className="">
                <div className="max-w-7xl mx-auto mt-2 grid grid-cols-7 gap-2 justify-items-center">
                    {
                        boards.map((item) => (
                            <button onClick={() => { navigate(`/board/${item.id}`, { state: { boardName: item.title } }); }} className="shadow-lg rounded w-full h-25 flex justify-center items-center hover:bg-gray-100" key={item.id}>{item.title}</button>
                        )
                        )
                    }

                    {!popup &&
                        <button className="shadow-lg rounded w-full h-25 flex justify-center items-center hover:bg-gray-100" onClick={() => { setPopup(true) }} >
                            <div>Create a new board</div>
                        </button>
                    }
                    {popup &&
                        <div className="relative border rounded w-50 h-25 ">
                            <div className=" absolute top-0 right-0">
                                <FiArrowLeft size={24} onClick={() => { setPopup(false) }} />
                            </div>
                            <NameAndInput type="name" name="Board Name:" value={name} setter={setName} ></NameAndInput>

                            <button onClick={createBoard} className="absolute bottom-0 rounded w-full flex justify-center border-t-1 hover:bg-gray-100">
                                Create
                            </button>
                        </div>
                    }

                    {/* {popup &&
                        <div className="flex justify-center items-center fixed inset-0 bg-black opacity-50">
                            <div className="bg-white w-sm rounded">
                        <NameAndInput></NameAndInput>
                    </div>
                    </div>
                    }  */}

                </div>
            </div>
        </div>
    )

}

