import { fetchWithRefresh } from "../../Refresh.tsx";
import { FaCheck } from "react-icons/fa";
import { X } from "lucide-react";
import { AutoResizeTextarea } from "../../components/AutoResizeTextArea.tsx";
import { FaCheckCircle, FaEdit, FaRegCircle, FaRegTrashAlt } from "react-icons/fa";
import { DraggableTask } from "./Drag.tsx"
export interface Task {
    id: number;
    name: string;
    completed: boolean;
    position: number;
}
import { useState } from "react";
import type { TaskList } from "./TaskList.tsx"
import { useNavigate } from "react-router-dom";


//export function useNewTask({setTaskLists, setEnterTaskListId, setTaskName, id} : {setTaskLists:React.Dispatch<React.SetStateAction<TaskList[]>>, setEnterTaskListId: React.Dispatch<React.SetStateAction<number | null>>, setTaskName: React.Dispatch<React.SetStateAction<string>>, id: number }) {

// Define function signatures
type NewTaskFn = (enterTaskListId: number, taskName: string) => Promise<void>;
type EditTaskNameFn = (editTaskId: number, taskName: string, taskListId: number) => Promise<void>;
type DeleteTaskFn = (taskId: number, taskListId: number) => Promise<void>;
type InsertTaskFn = (index: number, taskListId: number, task: Task) => Promise<void>;
type EditTaskPositionFn = (index1: number, index2: number, taskListId: number) => Promise<void>;

type ApiFunctions = {
    newTask: NewTaskFn;
    editTaskName: EditTaskNameFn;
    deleteTask: DeleteTaskFn;
    insertTask: InsertTaskFn;
    editTaskPosition: EditTaskPositionFn;
};

export function setUpApiTasks(boardId: number, setTaskLists: React.Dispatch<React.SetStateAction<TaskList[]>>, functionNames: string[], navigate: any): Partial<ApiFunctions> {

    const newTask = async (enterTaskListId: number, taskName: string) => {
        try {
            if (enterTaskListId === null) return; // No task list is selected

            const response = await fetchWithRefresh(`${import.meta.env.VITE_API_URL}/api/tasks/newtask`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    TaskName: taskName,
                    ListId: enterTaskListId,
                    BoardId: boardId
                }),
                credentials: "include"
            }, navigate);
            const data = await response.json();
            if (!response.ok)
                throw (data.message);
            else {
                setTaskLists(prevTaskLists => prevTaskLists.map(taskList => {
                    if (taskList.id === enterTaskListId) {
                        return {
                            ...taskList,
                            tasks: [...taskList.tasks, data.message]
                        }
                    }
                    return taskList;
                }));
                // setEnterTaskListId(null);
                // setTaskName('');
            }

        } catch (e) {
            console.log(e);
        }
    }

    const editTaskName = async (editTaskId: number, taskName: string, taskListId: number) => {
        try {
            if (editTaskId === null) return; // No task list is selected

            const response = await fetchWithRefresh(`${import.meta.env.VITE_API_URL}/api/tasks/edittask`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    TaskId: editTaskId,
                    TaskName: taskName,
                    ListId: taskListId,
                    BoardId: boardId
                }),
                credentials: "include"
            }, navigate);
            const data = await response.json();
            if (!response.ok)
                throw (data.message);
            else {
                setTaskLists(prevTaskLists => prevTaskLists.map(taskList => {
                    if (taskList.id === taskListId) {
                        return {
                            ...taskList,
                            tasks: taskList.tasks.map(task => {
                                if (task.id === editTaskId) {
                                    return { ...task, name: taskName };
                                }
                                return task;
                            })
                        }
                    }
                    return taskList;
                }));
                // setEditTaskId(null);
                // setTaskName('');
            }

        } catch (e) {
            console.log(e);
        }
    }

    const deleteTask = async (taskId: number, taskListId: number) => {
        try {
            const response = await fetchWithRefresh(`${import.meta.env.VITE_API_URL}/api/tasks/deletetask`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    TaskId: taskId,
                    ListId: taskListId,
                    BoardId: boardId
                }),
                credentials: "include"
            }, navigate);
            const data = await response.json();
            if (!response.ok)
                throw (data.message);
            else {
                setTaskLists(prevTaskLists => prevTaskLists.map(taskList => {
                    if (taskList.id !== taskListId)
                        return taskList;
                    return {
                        ...taskList,
                        tasks: taskList.tasks.filter(task => task.id !== taskId)
                    }
                }));
            }

        } catch (e) {
            console.log(e);
        }
    }

    const insertTask = async (index: number, taskListId: number, task: Task) => {
        try {
            const response = await fetchWithRefresh(`${import.meta.env.VITE_API_URL}/api/tasks/inserttask`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    Index: index,
                    ListId: taskListId,
                    Task: task,
                    BoardId: boardId
                }),
                credentials: "include"
            }, navigate);
            const data = await response.json();
            if (!response.ok)
                throw (data.message);

        } catch (e) {
            console.log(e);
        }
    }
    const editTaskPosition = async (index1: number, index2: number, taskListId: number) => {
        try {
            const response = await fetchWithRefresh(`${import.meta.env.VITE_API_URL}/api/tasks/edittaskposition`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    Index1: index1,
                    Index2: index2,
                    ListId: taskListId,
                    BoardId: boardId
                }),
                credentials: "include"
            }, navigate);
            let data;
            const text = await response.text();
            try {
                data = text ? JSON.parse(text) : null;
            } catch (e) {
                console.error("Failed to parse JSON:", text, e);
            }

            if (!response.ok) throw (data?.message || response.statusText);

        } catch (e) {
            console.log(e);
        }
    }

    const funcs: Partial<ApiFunctions> = {};
    functionNames.forEach((fn) => {
        if (fn === "newTask") funcs.newTask = newTask;
        if (fn === "editTaskName") funcs.editTaskName = editTaskName;
        if (fn === "deleteTask") funcs.deleteTask = deleteTask;
        if (fn === "insertTask") funcs.insertTask = insertTask;
        if (fn === "editTaskPosition") funcs.editTaskPosition = editTaskPosition;
    });

    return funcs;
}

function ToggleCheckIcon({ taskId, listId, boardId, completed }: { taskId: number, listId: number, boardId: number | undefined, completed: boolean }) {
    const [isChecked, setIsChecked] = useState(completed);
    const navigate = useNavigate();
    const checkTask = () => {
        setIsChecked(!isChecked);
        try {
            fetchWithRefresh(`${import.meta.env.VITE_API_URL}/api/tasks/togglecheck`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    TaskId: taskId, // Assuming task is defined in the scope
                    BoardId: boardId,
                    ListId: listId,
                    Completed: !isChecked
                }),
                credentials: "include"
            }, navigate);
        } catch (e) {
            console.error("Error toggling task completion:", e);
        }
    }
    return (
        <div onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { checkTask(); e.stopPropagation(); }} className={`${isChecked ? 'text-green-500' : ''}`}>
            {isChecked && <FaCheckCircle />}
            {!isChecked && <FaRegCircle />}
        </div>
    )
}

export function AddNewTask({ enterTaskListId, setEnterTaskListId, taskList, boardId, setTaskLists }: { enterTaskListId: number | null, setEnterTaskListId: React.Dispatch<React.SetStateAction<number | null>>, taskList: TaskList, boardId: number, setTaskLists: React.Dispatch<React.SetStateAction<TaskList[]>> }) {
    const { newTask } = setUpApiTasks(boardId, setTaskLists, ['newTask'], useNavigate());
    const [taskName, setTaskName] = useState('');
    return (
        enterTaskListId !== taskList.id ?
            <button onClick={() => { setEnterTaskListId(taskList.id); }} className="rounded p-2 text-left">
                + Add a new task
            </button>

            :
            <div className="mt-2">
                <AutoResizeTextarea taskName={taskName} setTaskName={setTaskName} editFunction={() => { newTask?.(taskList.id, taskName); setEnterTaskListId(null); setTaskName(""); }} setId={undefined} bold={false} />
                <div className="flex gap-2 mt-2">
                    <button onClick={() => { newTask?.(taskList.id, taskName); setEnterTaskListId(null); setTaskName(""); }} className="border rounded p-2">Add Task +</button>
                    <button className="rounded" onClick={() => { setEnterTaskListId(null); setTaskName(""); }}><X></X></button>
                </div>
            </div>
    )
}
export function TaskCard({ task, taskList, setTaskLists, setEditTaskId, id, taskLists, editTaskId, }: { task: Task, taskList: TaskList, setTaskLists: React.Dispatch<React.SetStateAction<TaskList[]>>, setEditTaskId: React.Dispatch<React.SetStateAction<number | null>>, id: number, taskLists: TaskList[], editTaskId: number | null }) {

    const { deleteTask, editTaskName } = setUpApiTasks(id, setTaskLists, ['deleteTask', 'editTaskName'], useNavigate());
    const [taskName, setTaskName] = useState(task.name);

    return (

        editTaskId === task.id ?
            (
                <div>
                    <div className="relative z-50">
                        <AutoResizeTextarea taskName={taskName} setTaskName={setTaskName} editFunction={() => { editTaskName?.(task.id, taskName, taskList.id) }} setId={undefined} bold={false} />
                        <div className="flex gap-2 items-center">
                            <FaCheck onClick={() => { editTaskName?.(task.id, taskName, taskList.id); setEditTaskId(null); setTaskName(''); }} className="text-green-500" /><X className="text-red-500" onClick={() => { setEditTaskId(null); setTaskName(''); }} />
                        </div>
                    </div>
                </div>)

            : (
                <DraggableTask className="relative flex justify-between items-center gap-1 rounded shadow-lg bg-white p-2 hover:border-blue-500 " setTaskLists={setTaskLists} boardId={id} taskList={taskList} task={task} taskLists={taskLists} >
                    <ToggleCheckIcon completed={task.completed} taskId={task.id} listId={taskList.id} boardId={id}></ToggleCheckIcon>
                    <div className="drag-handle whitespace-normal break-words w-5/6 ">{task.name}</div>
                    <div className="flex flex-col items-center text-gray-500 gap-1">
                        <FaRegTrashAlt size={12} onClick={() => { deleteTask?.(task.id, taskList.id); }} className="hover:text-black"></FaRegTrashAlt>
                        <FaEdit size={12} onClick={() => { setEditTaskId(task.id); setTaskName(task.name); }} className=" hover:text-black"></FaEdit>
                    </div>
                </DraggableTask>
            )
    )

}
