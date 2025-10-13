import { useState } from "react";
import type { TaskList } from "./TaskList.tsx";
import {fetchWithRefresh} from "../../Refresh.tsx";
import { AutoResizeTextarea } from "../../components/AutoResizeTextArea.tsx";
import { useNavigate } from "react-router-dom";

export default function EditTaskListName({boardId, taskList, editTaskListId, setEditTaskListId, setTaskLists}: {
    boardId: number,
    taskList: TaskList,
    editTaskListId: number|null,
    setEditTaskListId: React.Dispatch<React.SetStateAction<number | null>>,
    setTaskLists: React.Dispatch<React.SetStateAction<TaskList[]>>
}) {
    const navigate = useNavigate();
    const [taskName, setTaskName] = useState(taskList.name);
    const editTaskListName = async () => {
        try {

            const response = await fetchWithRefresh(`${import.meta.env.VITE_API_URL}/api/tasks/edittasklist`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    TaskListName: taskName,
                    ListId: editTaskListId,
                    BoardId: boardId
                }),
                credentials: "include"
            }, navigate);

            if (!response.ok)
                throw (response.status);

            else {
                setTaskLists((prev: TaskList[]) => {
                    const newTaskLists = prev.map((element) => {
                        if (element.id === taskList.id)
                            element.name = taskName;
                        return element;
                    })
                    return newTaskLists
                });
                setEditTaskListId(null);
            }

        } catch (e) {
            console.log(e);
        }
    }
        return (editTaskListId !== taskList.id ? (
            <div className="drag-handle-tasklist whitespace-normal break-normal wrap-anywhere font-semibold p-1 w-full">
                {taskList.name}
            </div>
            )
            : (
                <div className="drag-handle-tasklist">
                    <AutoResizeTextarea taskName={taskName} setTaskName={setTaskName} editFunction={editTaskListName} setId={setEditTaskListId} bold={true}/>
                </div>
            )
        );
    
}
