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
    id: number;
    name: string;
    tasks: Task[];
}

interface Task {
    id: number;
    name: string;
    completed: boolean;
}

export default function Board() {

    const [taskLists, setTaskLists] = useState<TaskList[]>([]);

    const { id } = useParams();
    const navigate = useNavigate();
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [enterTaskListId, setEnterTaskListId] = useState<number | null>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            setOpenMenuId(null);
        };
        if (openMenuId !== null) {
            document.addEventListener("click", handleClick);
        }
        try {
            fetch(`http://localhost:5235/api/tasks/tasklists/${id}`, {
                method: "GET",
                credentials: "include"

            }).then(async (response) => {
                if (!response.ok) { // but couldn't it go wrong for a reason other than not being logged in?
                    navigate("/");
                    return;
                }
                const data = await response.json();
                setTaskLists(data.message);
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
            else {
                setTaskLists(prevTaskLists => [...prevTaskLists, data.message]);
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
                setTaskLists(prevTaskLists => prevTaskLists.filter(task => task.id !== openMenuId));
        } catch (e) {
            console.log(e);
        }
    }
    const newTask = async () => {
        try {
            if (enterTaskListId === null) return; // No task list is selected

            const response = await fetch("http://localhost:5235/api/tasks/newtask", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    TaskName: taskName,
                    ListId: enterTaskListId,
                    BoardId: id
                }),
                credentials: "include"
            });
            const data = await response.json();
            if (!response.ok)
                throw (data.message);
            else{
                setTaskLists(prevTaskLists => prevTaskLists.map(taskList => {
                    if (taskList.id === enterTaskListId) {
                        return {
                            ...taskList,
                            tasks: [...taskList.tasks, data.message]
                        }
                    }
                    return taskList;
                }));
                setEnterTaskListId(null);
                setTaskName('');
            }
                
        } catch (e) {
            console.log(e);
        }
    }

    const [createListPrompt, setCreateListPrompt] = useState(false);
    const [listName, setListName] = useState('');
    const [taskName, setTaskName] = useState('');
    const [listHeight, setListHeight] = useState(20);

    return (
        <div>
            <div className="flex justify-center items-center p-2 border-b">
                Board Name
            </div>
            {/* Fix the scrollbar to be at the bottom of the screen */}
            <div className="overflow-x-auto whitespace-nowrap flex gap-2 px-2 mt-2 items-start">
                {
                    taskLists.map(taskList => (
                        <div className={`relative border rounded w-60  flex-none p-2`}>

                            <div onClick={e => { e.stopPropagation(); setOpenMenuId(taskList.id) }} className="rounded absolute top-0 right-0 w-8 h-8 flex justify-center items-center">
                                <FiMoreHorizontal size={16} />

                                {openMenuId === taskList.id &&
                                    <div className="border rounded text-white-500 w-70 bg-white absolute left-0 top-full z-50  "
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <div className="flex justify-center py-2 font-semibold">
                                            List Actions
                                        </div>
                                        <button onClick={deleteTaskList} className="rounded px-2 text-red-500 flex justify-left w-full">
                                            Delete
                                        </button>
                                    </div>
                                }
                            </div>


                            <div className=" font-semibold">
                                {taskList.name}
                            </div>
                            {taskList.tasks && taskList.tasks.map((task) => (
                                <div>{task.name}</div>
                            ))}

                            {enterTaskListId !== taskList.id &&
                                //<button onClick={() => { setEnterTaskListId(taskList.id); setListHeight(prevHeight => prevHeight + 20); }} className="rounded absolute bottom-2 left-2">
                                <button onClick={() => { setEnterTaskListId(taskList.id); setListHeight(prevHeight => prevHeight + 20); }} className="rounded">
                                    + Add a new task
                                </button>
                            }
                            {enterTaskListId === taskList.id &&
                                <div className="mt-2">
                                        <NameAndInputPreview type="task" name="Enter Task Name..." value={taskName} setter={setTaskName} />
                                    <div className="flex gap-2 mt-2">
                                        <button onClick={newTask} className= "border rounded p-2">Add Task +</button>
                                        <button className = "rounded" onClick={() => { setEnterTaskListId(null); setTaskName(""); }}><X></X></button>
                                    </div>
                                </div>
                            }
                        </div>
                    ))
                }

                {
                    !createListPrompt &&
                    <button onClick={() => setCreateListPrompt(true)} className="py-2 justify-center items-center border rounded w-60 flex-none">+ Create a new list</button>
                }
                {
                    createListPrompt &&
                    <div className="relative border rounded w-60 flex-none p-2">

                        <div className="flex justify-center">
                            <NameAndInputPreview type="name" name="Enter List Name..." value={listName} setter={setListName} ></NameAndInputPreview>
                        </div>
                        <div className="flex gap-2 mt-2">
                            <button onClick={newTaskList} className=" border rounded p-2">Add List +</button>
                            <button onClick={() => { setCreateListPrompt(false); setListName(""); }}><X></X></button>
                        </div>
                    </div>
                }


            </div>
        </div>
    )

}


function ToggleCheckIcon(){

}