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

export function setUpApiTasks(boardId: number, setTaskLists: React.Dispatch<React.SetStateAction<TaskList[]>>, functionNames: string[], navigate: any) {

    const newTask = async (taskListId: number, taskName: string) => {
        try {
            const response = await fetchWithRefresh(`${import.meta.env.VITE_API_URL}/api/tasks/newtask`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
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
                            tasks: [...taskList.tasks, data.message]
                        }
                    }
                    return taskList;
                }));
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

    const funcs: Record<string, any> = {};
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
                    TaskId: taskId,
                    BoardId: boardId,
                    ListId: listId,
                    Completed: !isChecked
                }),
                credentials: "include"
            }, navigate);
        } catch (e) {
            console.error("Error toggling task completion:", e);
        }
    };

    return (
        <button
            type="button"
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => {
                event.stopPropagation();
                checkTask();
            }}
            className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
                isChecked
                    ? "border-green-200 bg-green-50 text-green-500 hover:border-green-300"
                    : "border-slate-200 bg-white text-slate-400 hover:border-indigo-200 hover:text-indigo-400"
            }`}
        >
            {isChecked ? <FaCheckCircle /> : <FaRegCircle />}
        </button>
    );
}

export function AddNewTask({ enterTaskListId, setEnterTaskListId, taskList, boardId, setTaskLists }: { enterTaskListId: number | null, setEnterTaskListId: React.Dispatch<React.SetStateAction<number | null>>, taskList: TaskList, boardId: number, setTaskLists: React.Dispatch<React.SetStateAction<TaskList[]>> }) {
    const { newTask } = setUpApiTasks(boardId, setTaskLists, ['newTask'], useNavigate());
    const [taskName, setTaskName] = useState('');
    return (
        enterTaskListId !== taskList.id ?
            <button
                type="button"
                onClick={() => {
                    setEnterTaskListId(taskList.id);
                }}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white/70 px-3 py-2 text-sm font-medium text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50/60 hover:text-indigo-500"
            >
                <span className="text-lg leading-none">+</span>
                <span>Add task</span>
            </button>
            :
            <div className="mt-2 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm">
                <AutoResizeTextarea
                    taskName={taskName}
                    setTaskName={setTaskName}
                    editFunction={() => {
                        newTask?.(taskList.id, taskName);
                        setEnterTaskListId(null);
                        setTaskName("");
                    }}
                    setId={undefined}
                    bold={false}
                />
                <div className="mt-3 flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            newTask?.(taskList.id, taskName);
                            setEnterTaskListId(null);
                            setTaskName("");
                        }}
                        className="rounded-2xl bg-indigo-500 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-1"
                    >
                        Add task
                    </button>
                    <button
                        type="button"
                        className="rounded-2xl border border-slate-200 p-2 text-slate-400 transition hover:border-slate-300 hover:text-slate-600"
                        onClick={() => {
                            setEnterTaskListId(null);
                            setTaskName("");
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>
    )
}
export function TaskCard({ task, taskList, setTaskLists, setEditTaskId, id, taskLists, editTaskId, handleScheduleDelete, pendingDeletion }: {
    task: Task,
    taskList: TaskList,
    setTaskLists: React.Dispatch<React.SetStateAction<TaskList[]>>,
    setEditTaskId: React.Dispatch<React.SetStateAction<number | null>>,
    id: number,
    taskLists: TaskList[],
    editTaskId: number | null,
    handleScheduleDelete?: (taskId: number, taskListId: number, boardId: number) => void,
    pendingDeletion?: any
}) {

    const { deleteTask, editTaskName } = setUpApiTasks(id, setTaskLists, ['deleteTask', 'editTaskName'], useNavigate());
    const [taskName, setTaskName] = useState(task.name);

    return (
        editTaskId === task.id ?
            (
                <div className="rounded-2xl border border-indigo-100 bg-white/90 p-4 shadow-sm">
                    <AutoResizeTextarea
                        taskName={taskName}
                        setTaskName={setTaskName}
                        editFunction={() => {
                            editTaskName?.(task.id, taskName, taskList.id);
                            setEditTaskId(null);
                            setTaskName("");
                        }}
                        setId={undefined}
                        bold={false}
                    />
                    <div className="mt-3 flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                editTaskName?.(task.id, taskName, taskList.id);
                                setEditTaskId(null);
                                setTaskName("");
                            }}
                            className="inline-flex items-center gap-2 rounded-full bg-green-500/90 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 focus:ring-offset-1"
                        >
                            <FaCheck size={14} />
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setEditTaskId(null);
                                setTaskName("");
                            }}
                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
                        >
                            <X size={14} />
                            Cancel
                        </button>
                    </div>
                </div>
            )
            : (
                <DraggableTask
                    className={`group relative flex items-start gap-3 rounded-3xl border border-transparent bg-white/90 p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-lg ${
                        pendingDeletion && pendingDeletion.taskId === task.id
                            ? "border-rose-200 bg-rose-50/80"
                            : ""
                    }`}
                    setTaskLists={setTaskLists}
                    boardId={id}
                    taskList={taskList}
                    task={task}
                    taskLists={taskLists}
                >
                    <div
                        className={`flex flex-1 items-start gap-3 ${
                            pendingDeletion && pendingDeletion.taskId === task.id ? "opacity-50" : ""
                        }`}
                    >
                        <ToggleCheckIcon
                            completed={task.completed}
                            taskId={task.id}
                            listId={taskList.id}
                            boardId={id}
                        ></ToggleCheckIcon>
                        <div className="drag-handle-task min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-700 break-normal wrap-anywhere">{task.name}</p>
                            {task.completed && (
                                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-green-400">
                                    Completed
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-2 self-stretch">
                        {pendingDeletion && pendingDeletion.taskId === task.id && (
                            <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                        )}
                        <button
                            type="button"
                            onClick={() => {
                                if (handleScheduleDelete) {
                                    handleScheduleDelete?.(task.id, taskList.id, id);
                                } else {
                                    deleteTask?.(task.id, taskList.id);
                                }
                            }}
                            className={`flex h-8 w-8 items-center justify-center rounded-full border text-slate-400 transition hover:border-rose-200 hover:text-rose-500 ${
                                pendingDeletion && pendingDeletion.taskId === task.id
                                    ? "border-rose-200 bg-rose-50 text-rose-500"
                                    : "border-slate-200 bg-white"
                            }`}
                        >
                            <FaRegTrashAlt size={12} />
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                if (!(pendingDeletion && pendingDeletion.taskId === task.id)) {
                                    setEditTaskId(task.id);
                                    setTaskName(task.name);
                                }
                            }}
                            className={`flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition hover:border-indigo-200 hover:text-indigo-500 ${
                                pendingDeletion && pendingDeletion.taskId === task.id
                                    ? "cursor-not-allowed opacity-40"
                                    : ""
                            }`}
                        >
                            <FaEdit size={12} />
                        </button>
                    </div>
                </DraggableTask>
            )
    )
}
