import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import NameAndInput, {NameAndInputPreview} from "../components/NameAndInput";

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
            fetch("http://localhost:5235/api/dashboard/boards",
                {
                    method: "GET",
                    credentials: "include"
                }
            ).then(async response => {
                if (!response.ok) {
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
            const response = await fetch("http://localhost:5235/api/dashboard/board", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"   
                },
                body: JSON.stringify({
                    Title: name
                }),
                credentials: "include"
            });

            const data = await response.json();
            if (!response.ok)
                throw Error("bad request");
            console.log(data.message);
            navigate(`/board/${data.message.id}`, {state: {boardName: data.message.title}});

        } catch (e) {
            console.log("Error: ", e);
        }
    };

    return (
        <div>
            <div className="flex justify-center py-2 text-4xl border-b-2">
                My boards
            </div>
            <div className="max-w-7xl mx-auto mt-2 flex flex-row gap-2">
                {
                    boards.map((item) => (
                        <button onClick={() => {navigate(`/board/${item.id}`, {state: {boardName: item.title}});}}  className="shadow-lg rounded w-50 h-25 flex justify-center items-center hover:bg-gray-100" key={item.id}>{item.title}</button>
                    )
                    )
                }

                {!popup &&
                    <button className="shadow-lg rounded w-50 h-25 flex justify-center items-center hover:bg-gray-100" onClick={() => { setPopup(true) }} >
                        <div>Create a new board</div>
                    </button>
                }
                {popup &&
                    <div className="relative border rounded w-50 h-25 ">
                        <div className=" absolute top-0 right-0">
                            <FiArrowLeft size={24} onClick={() => { setPopup(false) }} />
                        </div>
                        <NameAndInput type="name" name="Board Name:" value={name} setter={setName} ></NameAndInput>

                        <div className="absolute bottom-0 rounded w-full flex justify-center border-t-1 hover:bg-gray-100">
                            <button onClick={createBoard} className=""> Create </button>
                        </div>
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
    )

}

function TableCard(){
    return 
}