import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NameAndInput, { NameAndInputPreview } from "../components/NameAndInput";
import { X } from "lucide-react";
import { FiMoreHorizontal } from "react-icons/fi";


interface Board {
    id: string;
    name: string;
    taskLists: TaskList[];
}

interface TaskList {
    id: string;
    name: string;
    tasks: Task[];
}

interface Task {
    id: number;
    name: string;
    description: string;
}

export default function Board() {

    const [tasks, setTasks] = useState<Task[]>([]);

    const { id } = useParams();
    const navigate = useNavigate();
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            setOpenMenuId(null);
        };
        if (openMenuId !== null) {
            document.addEventListener("click", handleClick);
        }
        try {
            fetch("http://localhost:5235/api/tasks/tasklists", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    BoardId: id
                }),
                credentials: "include"

            }).then(async (response) => {
                if (!response.ok) { // but couldn't it go wrong for a reason other than not being logged in?
                    navigate("/");
                    return;
                }
                const data = await response.json();
                setTasks(data.message);
                console.log("Success! Board data:", data);
            })
        } catch (e) {
            console.log(e);
        }
        finally {
            return () => { document.removeEventListener("click", handleClick); };
        }
    }, [openMenuId]);

    const newTaskList = async () => {

        try {
            const response = await fetch("http://localhost:5235/api/tasks/maketasklist", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    TaskListName: listName,
                    BoardId: id
                }),
                credentials: "include"
            });
            const data = await response.json();
            if (!response.ok)
                throw (data.message);
            else{
                setTasks(prevTasks => [...prevTasks, data.message]);
                setCreateListPrompt(false);
                setListName(''); // Clear the input field after creating a new task list
            }


        } catch (e) {
            console.log(e);
        }
    }

    const deleteTaskList = async () => {
        try {
            if (openMenuId === null) return; // No task list is selected

            const response = await fetch("http://localhost:5235/api/tasks/deletetasklist", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ListId: openMenuId,
                    BoardId: id
                }),
                credentials: "include"
            });
            const data = await response.json();
            if (!response.ok)
                throw (data.message);
            else
                setTasks(prevTasks => prevTasks.filter(task => task.id !== openMenuId));
        } catch (e) {
            console.log(e);
        }
    }

    const [createListPrompt, setCreateListPrompt] = useState(false);
    const [listName, setListName] = useState('');

    return (
        <div>
            <div className="flex justify-center items-center p-2 border-b">
                Board Name
            </div>
            {/* Fix the scrollbar to be at the bottom of the screen */}
            <div className="overflow-x-auto whitespace-nowrap flex gap-2 px-2 mt-2 h-screen ">
                {
                    tasks.map(task => (
                        <div className="relative border rounded w-60 h-20 flex-none">

                            <div onClick={e => { e.stopPropagation(); setOpenMenuId(task.id) }} className="rounded absolute top-1 right-2 w-8 h-8 flex justify-center items-center">
                                <FiMoreHorizontal size={16} />

                                {openMenuId === task.id &&
                                    <div className="border rounded text-white-500 w-70 bg-white absolute left-0 top-full z-50  "
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <div className="py-2 font-semibold">
                                            List Actions
                                        </div>
                                        <button onClick={deleteTaskList} className="rounded px-2 text-red-500 flex justify-left w-full">
                                            Delete
                                        </button>
                                    </div>
                                }
                            </div>


                            <div className="mt-1 ml-2 font-semibold">
                                {task.name}
                            </div>
                            <button className="rounded absolute bottom-2 left-2">
                                + Add a new task
                            </button>
                        </div>
                    ))
                }

                {
                    !createListPrompt &&
                    <button onClick={() => setCreateListPrompt(true)} className="py-2 justify-center items-center border rounded w-60 h-20 flex-none">+ Create a new list</button>
                }
                {
                    createListPrompt &&
                    <div className="relative border rounded w-60 h-20 flex-none">

                        <div className="mt-2 flex justify-center">
                            <NameAndInputPreview type="name" name="Enter List Name..." value={listName} setter={setListName} ></NameAndInputPreview>
                        </div>
                        <div className="flex absolute bottom-2 left-2 gap-2">
                            <button onClick={newTaskList} className=" border rounded px-2">Create +</button>
                            <button onClick={() => { setCreateListPrompt(false) }}><X></X></button>
                        </div>
                    </div>
                }


            </div>
        </div>
    )

}