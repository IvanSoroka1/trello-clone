import { X } from "lucide-react";
import type { Task } from "./Task.tsx";
import { useState } from "react";
import { TaskCard } from "./Task.tsx";
import { AddNewTask } from "./Task.tsx";
import { NameAndInputPreview } from "../../components/NameAndInput.tsx";
import { FiMoreHorizontal } from "react-icons/fi";
import { DraggableTaskList} from "./Drag.tsx";
import EditTaskListName from "./EditTaskListName.tsx";

export interface TaskList {
    id: number;
    name: string;
    tasks: Task[];
    position: number;
}

type NewTaskListFn = (listName: string) => Promise<void>
type DeleteTaskListFn = (openMenuId: number) => Promise<void>
type EditTaskListPositionFn = (index1: number, index2: number) => Promise<void>
type ApiFunctions = {
    newTaskList: NewTaskListFn;
    deleteTaskList: DeleteTaskListFn;
    editTaskListPosition: EditTaskListPositionFn;
};

export function setUpApiTaskList(id: number, setTaskLists: React.Dispatch<React.SetStateAction<TaskList[]>>, functionNames: string[]): Partial<ApiFunctions> {
    const newTaskList = async (listName: string) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/maketasklist`, {
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
                // take care of these lines outside of the function??
                // setCreateListPrompt(false); 
                // setListName(''); // Clear the input field after creating a new task list
            }

        } catch (e) {
            console.log(e);
        }
    }

    const deleteTaskList = async (openMenuId: number) => {
        try {
            if (openMenuId === null) return; // No task list is selected

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/deletetasklist`, {
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

    const editTaskListPosition = async (index1: number, index2: number) => { // should be renamed swapTaskLists
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/edittasklistposition`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    Index1: index1,
                    Index2: index2,
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

    const funcs: Partial<ApiFunctions> = {};
    functionNames.forEach((fn) => {
        if (fn === "newTaskList") funcs.newTaskList = newTaskList;
        if (fn === "deleteTaskList") funcs.deleteTaskList = deleteTaskList;
        if (fn === "editTaskListPosition") funcs.editTaskListPosition = editTaskListPosition;
    });

    return funcs;
}


export function AddNewList({ boardId, setTaskLists }: { boardId: number, setTaskLists: React.Dispatch<React.SetStateAction<TaskList[]>> }) {
    const [listName, setListName] = useState('');
    const [createListPrompt, setCreateListPrompt] = useState(false); // could this create a problem of multiple prompts?
    const { newTaskList } = setUpApiTaskList(boardId, setTaskLists, ['newTaskList']);
    return (
        !createListPrompt ?
            <button onClick={() => setCreateListPrompt(true)} className="py-2 justify-center shadow-lg items-center order rounded w-60 flex-none">+ Create a new list</button>

            :
            <div className="relative border rounded w-60 flex-none p-2">

                <div className="flex justify-center">
                    <NameAndInputPreview type="name" name="Enter List Name..." value={listName} setter={setListName} ></NameAndInputPreview>
                </div>
                <div className="flex gap-2 mt-2">
                    <button onClick={() => { newTaskList?.(listName); setCreateListPrompt(false); setListName(""); }} className=" border rounded p-2">Add List +</button>
                    <button onClick={() => { setCreateListPrompt(false); setListName(""); }}><X></X></button>
                </div>
            </div>
    )
}
function TaskListMenu({ taskList, boardId, setTaskLists }: { taskList: TaskList, boardId: number, setTaskLists: React.Dispatch<React.SetStateAction<TaskList[]>> }) {

    const { deleteTaskList } = setUpApiTaskList(boardId, setTaskLists, ['deleteTaskList']);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null); // could this allow more than one menu open at once? Wouldn't want that.

    return (
        <div style={{ width: "1.5rem", height: "1.5rem" }} onMouseDown={(e) => { e.stopPropagation(); }} onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId == null ? taskList.id : null) }} className="relative rounded flex justify-center items-center hover:bg-gray-200">
            <FiMoreHorizontal size={16} />

            {openMenuId === taskList.id &&
                <div className="shadow rounded text-white-500 w-70 bg-white absolute left-0 top-full z-50 "
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex justify-center py-2 font-semibold">
                        List Actions
                    </div>
                    <button onClick={() => deleteTaskList?.(openMenuId)} className="rounded px-2 text-red-500 flex justify-left w-full">
                        Delete
                    </button>
                </div>
            }
        </div>
    )
}

export default function TaskListCard({ taskList, setTaskLists, editTaskId, setEditTaskId, BoardId: boardId, editTaskListId, setEditTaskListId, enterTaskListId, setEnterTaskListId, taskLists }: { taskList: TaskList, editTaskId: number | null, setEditTaskId: React.Dispatch<React.SetStateAction<number | null>>, setTaskLists: React.Dispatch<React.SetStateAction<TaskList[]>>, BoardId: number, enterTaskListId: number | null, setEnterTaskListId: React.Dispatch<React.SetStateAction<number | null>>, taskLists: TaskList[], editTaskListId: number | null, setEditTaskListId: React.Dispatch<React.SetStateAction<number | null>>}) {

    return (
        <DraggableTaskList setEditTaskListId={setEditTaskListId} setTaskLists={setTaskLists} boardId={boardId} taskLists={taskLists} element={taskList}>
            <div className="flex flex-row justify-between items-center ">
                <EditTaskListName boardId={boardId!} taskList={taskList} editTaskListId={editTaskListId} setEditTaskListId={setEditTaskListId} setTaskLists={setTaskLists} />
                <TaskListMenu taskList={taskList} boardId={boardId} setTaskLists={setTaskLists} />
            </div>
            {taskList.tasks && taskList.tasks.map((task: Task) => (
                <div id={`task-${task.id}`} key={task.id}>
                    <TaskCard task={task} taskList={taskList} setTaskLists={setTaskLists} setEditTaskId={setEditTaskId} id={boardId} taskLists={taskLists} editTaskId={editTaskId}  />
                </div>
            )
            )
            }
            <AddNewTask enterTaskListId={enterTaskListId} setEnterTaskListId={setEnterTaskListId} taskList={taskList} boardId={boardId} setTaskLists={setTaskLists} />
        </DraggableTaskList>
    )
}
