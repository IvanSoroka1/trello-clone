import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NameAndInput, { NameAndInputPreview } from "../components/NameAndInput";
import { X } from "lucide-react";


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
    id: string;
    name: string;
    description: string;
}

export default function Board() {

    const [tasks, setTasks] = useState<Task[]>([]);

    const { id } = useParams();
    const navigate = useNavigate();
    useEffect(() => {
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
    }, []);

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
            <div className="flex gap-2 max-w-7xl mx-auto mt-2">
                {
                    tasks.map(task => (
                        <div className="relative border rounded w-60 h-20">
                            <div className="mt-1 ml-2 font-medium">
                                {task.name}
                            </div>
                            + Add a new task
                        </div>
                    ))
                }

                {
                    !createListPrompt &&
                    <button onClick={() => setCreateListPrompt(true)} className="py-2 justify-center items-center border rounded w-60">+ Create a new list</button>
                }
                {
                    createListPrompt &&
                    <div className="relative border rounded w-60 h-20">

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