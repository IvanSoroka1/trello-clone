import { fetchWithRefresh } from "../../Refresh.tsx";
import { useEffect, useState } from "react";
import TaskListCard from "./TaskList.tsx";
import type { TaskList } from "./TaskList.tsx";
import type { Task } from "./Task.tsx"
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AddNewList } from "./TaskList.tsx";
import ElipsesMenuButton from "./ElipsesMenuButton.tsx"

function initBoard(id: string | undefined, navigate: any, setLoading: React.Dispatch<React.SetStateAction<boolean>>) {
    const [taskLists, setTaskLists] = useState<TaskList[]>([]);
    useEffect(() => {
        try {
            if (id === undefined) {
                navigate("/");
                return;
            }

            fetchWithRefresh(`${import.meta.env.VITE_API_URL}/api/tasks/tasklists/${id}`, {
                method: "GET",
                credentials: "include"

            }, navigate).then(async (response) => {
                if (!response.ok && response.status !== 401) { // but couldn't it go wrong for a reason other than not being logged in?
                    navigate("/");
                    return;
                }
                setLoading(false);
                const data = await response.json();

                data.message.sort((a: TaskList, b: TaskList) => a.position - b.position);

                for (const i in data.message) {
                    data.message[i].tasks.sort((a: Task, b: Task) => a.position - b.position);
                }

                setTaskLists(data.message);

                console.log("Success! Board data:", data);
            })
        } catch (e) {
            console.log(e);
        }
    }, []);
    return { taskLists, setTaskLists };
}


export default function Board() {

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { id } = useParams();
    const { taskLists, setTaskLists } = initBoard(id, navigate, setLoading);
    const location = useLocation();
    const boardName = location.state?.boardName || "Board Name"; // but if you have a bookmark for the page, you're going to need to look in the database for the name of the board
    const [enterTaskListId, setEnterTaskListId] = useState<number | null>(null); // so that only one list can have a task added to it at a time
    const [editTaskId, setEditTaskId] = useState<number | null>(null); // so that only one task of any list can be edited at a time
    const [editTaskListId, setEditTaskListId] = useState<number | null>(null); // so that only one taskList can be edited at a time
    const [openMenuId, setOpenMenuId] = useState<number | null>(null); // so that only one menu can be open at a time
    const [draggingId, setDraggingId] = useState<number | null>(null);

    return (
        <div>
            <div className="flex justify-center items-center p-2 border-b">
                {boardName}
                <div className="absolute right-2">
                    <ElipsesMenuButton id={parseInt(id!, 10)} />
                </div>
            </div>

            {loading ?
                    <div className="absolute inset-0 flex justify-center items-center text-4xl"> Loading... </div> 
                    :
            <div className="overflow-x-auto whitespace-nowrap flex gap-2 px-2 mt-2 items-start h-screen">
                {
                    // some of the props that are being sent to TaskListCard are being used by the children of the TaskListCard but not the TaskListCard itself. Should I use a context to fix this?
                    taskLists.map(
                        (taskList: TaskList) => <TaskListCard key={taskList.id} taskList={taskList} setTaskLists={setTaskLists} editTaskId={editTaskId} setEditTaskId={setEditTaskId} BoardId={parseInt(id!, 10)} enterTaskListId={enterTaskListId} setEnterTaskListId={setEnterTaskListId} taskLists={taskLists} editTaskListId={editTaskListId} setEditTaskListId={setEditTaskListId} openMenuId={openMenuId} setOpenMenuId={setOpenMenuId} draggingId={draggingId} setDraggingId={setDraggingId} />
                    )
                }
                <AddNewList boardId={parseInt(id!, 10)} setTaskLists={setTaskLists} />
            </div>
            }
        </div >
    )

}