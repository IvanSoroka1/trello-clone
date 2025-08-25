import { useState } from "react";
import type { TaskList } from "./Board.tsx";
import { AutoResizeTextarea } from "./Board.tsx";

export default function EditTaskListName({boardId, taskList, editTaskListId, setEditTaskListId, setTaskLists}: {
    boardId: string,
    taskList: TaskList,
    editTaskListId: number|null,
    setEditTaskListId: React.Dispatch<React.SetStateAction<number | null>>,
    setTaskLists: React.Dispatch<React.SetStateAction<TaskList[]>>
}) {
    const [taskName, setTaskName] = useState(taskList.name);
    const editTaskListName = async () => {
        try {

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/edittasklist`, {
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
            });

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
            <div onMouseDown= {(e) => { e.stopPropagation() }} onClick={() => { setEditTaskListId(taskList.id); setTaskName(taskList.name) }} className="whitespace-normal break-all font-semibold p-1">
                {taskList.name}
            </div>)
            : (
                // <input onMouseDown= {(e) => { e.stopPropagation() }} value={taskName}
                //     onChange={e => setTaskName(e.target.value)}
                //     className="w-6/7 rounded-lg p-1 bg-white font-semibold"
                //     onKeyDown={(e) => e.key === "Enter" && editTaskListName()}
                //     onBlur={() => setEditTaskListId(null)}
                //     autoFocus>
                // </input>
                <AutoResizeTextarea taskName={taskName} setTaskName={setTaskName} editFunction={editTaskListName} setId={setEditTaskListId} bold={true}/>
            )
        );
    
}
