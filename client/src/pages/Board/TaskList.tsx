import { fetchWithRefresh } from "../../Refresh.tsx";
import { X } from "lucide-react";
import type { Task } from "./Task.tsx";
import { useState } from "react";
import { TaskCard } from "./Task.tsx";
import { AddNewTask } from "./Task.tsx";
import { AutoResizeTextarea } from "../../components/AutoResizeTextArea.tsx";
import { DraggableTaskList } from "./Drag.tsx";
import EditTaskListName from "./EditTaskListName.tsx";
import { useNavigate } from "react-router-dom";
import { TaskListMenu } from "../TaskListMenu.tsx";

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

export function setUpApiTaskList(id: number, setTaskLists: React.Dispatch<React.SetStateAction<TaskList[]>>, functionNames: string[], navigate: any): Partial<ApiFunctions> {
    const newTaskList = async (listName: string) => {
        try {
            const response = await fetchWithRefresh(`${import.meta.env.VITE_API_URL}/api/tasks/maketasklist`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    TaskListName: listName,
                    BoardId: id
                }),
                credentials: "include"
            }, navigate);
            const data = await response.json();
            if (!response.ok)
                throw (data.message);
            else {
                setTaskLists(prevTaskLists => [...prevTaskLists, data.message]);
                // The createListPrompt and listName state are handled in the AddNewList component
            }

        } catch (e) {
            console.log(e);
        }
    }

    const deleteTaskList = async (openMenuId: number) => {
        try {
            if (openMenuId === null) return; // No task list is selected

            const response = await fetchWithRefresh(`${import.meta.env.VITE_API_URL}/api/tasks/deletetasklist`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ListId: openMenuId,
                    BoardId: id
                }),
                credentials: "include"
            }, navigate);
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
            const response = await fetchWithRefresh(`${import.meta.env.VITE_API_URL}/api/tasks/edittasklistposition`, {
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
        if (fn === "newTaskList") funcs.newTaskList = newTaskList;
        if (fn === "deleteTaskList") funcs.deleteTaskList = deleteTaskList;
        if (fn === "editTaskListPosition") funcs.editTaskListPosition = editTaskListPosition;
    });

    return funcs;
}


export function AddNewList({ boardId, setTaskLists }: { boardId: number, setTaskLists: React.Dispatch<React.SetStateAction<TaskList[]>> }) {
    const [listName, setListName] = useState('');
    const [createListPrompt, setCreateListPrompt] = useState(false); // could this create a problem of multiple prompts?
    const { newTaskList } = setUpApiTaskList(boardId, setTaskLists, ['newTaskList'], useNavigate());
    return (
        !createListPrompt ? (
            <button
                type="button"
                onClick={() => setCreateListPrompt(true)}
                className="flex h-56 w-[18rem] flex-none flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-slate-300 bg-white/70 text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50/60 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-1"
            >
                <span className="text-3xl">+</span>
                <span className="text-sm font-semibold uppercase tracking-widest">New list</span>
                <span className="text-xs text-slate-400">Group related tasks together</span>
            </button>
        ) : (
            <div className="relative flex h-56 w-[18rem] flex-none flex-col rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                <div className="text-sm font-semibold text-slate-600">List name</div>
                <div className="mt-2 flex-1">
                    <AutoResizeTextarea
                        taskName={listName}
                        setTaskName={setListName}
                        editFunction={() => {
                            newTaskList?.(listName);
                            setCreateListPrompt(false);
                            setListName("");
                        }}
                        setId={undefined}
                        bold={false}
                    />
                </div>
                <div className="mt-4 flex items-center justify-between gap-2">
                    <button
                        type="button"
                        onClick={(event) => {
                            event.preventDefault();
                            newTaskList?.(listName);
                            setCreateListPrompt(false);
                            setListName("");
                        }}
                        className="flex-1 rounded-2xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-1"
                    >
                        Add list
                    </button>
                    <button
                        type="button"
                        onClick={(event) => {
                            event.preventDefault();
                            setCreateListPrompt(false);
                            setListName("");
                        }}
                        className="rounded-2xl border border-slate-200 p-2 text-slate-400 transition hover:border-slate-300 hover:text-slate-600"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>
        )

    )
}



export default function TaskListCard({ taskList, setTaskLists, editTaskId, setEditTaskId, BoardId: boardId, editTaskListId, setEditTaskListId, enterTaskListId, setEnterTaskListId, openMenuId, setOpenMenuId, taskLists, draggingId, setDraggingId, handleScheduleDelete, pendingDeletion }: {
    taskList: TaskList,
    editTaskId: number | null,
    setEditTaskId: React.Dispatch<React.SetStateAction<number | null>>,
    setTaskLists: React.Dispatch<React.SetStateAction<TaskList[]>>,
    BoardId: number,
    enterTaskListId: number | null,
    setEnterTaskListId: React.Dispatch<React.SetStateAction<number | null>>,
    openMenuId: number | null,
    setOpenMenuId: React.Dispatch<React.SetStateAction<number | null>>,
    taskLists: TaskList[],
    editTaskListId: number | null,
    setEditTaskListId: React.Dispatch<React.SetStateAction<number | null>>,
    draggingId: number | null,
    setDraggingId: React.Dispatch<React.SetStateAction<number | null>>,
    handleScheduleDelete?: (taskId: number, taskListId: number, boardId: number) => void,
    pendingDeletion?: any
}) {

    return (
        <DraggableTaskList
            className="flex w-[18rem] flex-none flex-col gap-4 rounded-3xl border border-transparent bg-white/90 p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-lg"
            setEditTaskListId={setEditTaskListId}
            setTaskLists={setTaskLists}
            boardId={boardId}
            taskLists={taskLists}
            element={taskList}
            draggingId={draggingId}
            setDraggingId={setDraggingId}
            editTaskListId={editTaskListId}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 flex-col">
                    <EditTaskListName
                        boardId={boardId!}
                        taskList={taskList}
                        editTaskListId={editTaskListId}
                        setEditTaskListId={setEditTaskListId}
                        setTaskLists={setTaskLists}
                    />
                    <p className="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                        {taskList.tasks.length} {taskList.tasks.length === 1 ? "task" : "tasks"}
                    </p>
                </div>
                <TaskListMenu
                    taskList={taskList}
                    boardId={boardId}
                    setTaskLists={setTaskLists}
                    openMenuId={openMenuId}
                    setOpenMenuId={setOpenMenuId}
                />
            </div>

            <div className="flex flex-1 flex-col gap-3">
                {taskList.tasks &&
                    taskList.tasks.map((task: Task) => (
                        <div id={`task-${task.id}`} key={task.id}>
                            <TaskCard
                                task={task}
                                taskList={taskList}
                                setTaskLists={setTaskLists}
                                setEditTaskId={setEditTaskId}
                                id={boardId}
                                taskLists={taskLists}
                                editTaskId={editTaskId}
                                handleScheduleDelete={handleScheduleDelete}
                                pendingDeletion={pendingDeletion}
                            />
                        </div>
                    ))}
            </div>

            <AddNewTask
                enterTaskListId={enterTaskListId}
                setEnterTaskListId={setEnterTaskListId}
                taskList={taskList}
                boardId={boardId}
                setTaskLists={setTaskLists}
            />
        </DraggableTaskList>
    )
}
