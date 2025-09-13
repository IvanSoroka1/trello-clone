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
        !createListPrompt ?
            (<button onClick={() => setCreateListPrompt(true)} className="py-2 justify-center shadow-lg items-center rounded w-60 flex-none">+ Create a new list</button>)
            :
            (
                <div className="relative border rounded w-60 flex-none p-2">
                    <div className="flex justify-center">
                        <AutoResizeTextarea taskName={listName} setTaskName={setListName} editFunction={() => { newTaskList?.(listName); setCreateListPrompt(false); setListName(""); }} setId={undefined} bold={false} />
                    </div>
                    <div className="flex gap-2 mt-2">
                        <button type = "button" onClick={(e) => {e.preventDefault(); newTaskList?.(listName); setCreateListPrompt(false); setListName(""); }} className=" border rounded p-2">Add List +</button>
                        <button type = "button" onClick={(e) => { e.preventDefault(); setCreateListPrompt(false); setListName(""); }}><X /></button>
                    </div>
                </div>
            )

    )
}



export default function TaskListCard({ taskList, setTaskLists, editTaskId, setEditTaskId, BoardId: boardId, editTaskListId, setEditTaskListId, enterTaskListId, setEnterTaskListId, openMenuId, setOpenMenuId, taskLists, draggingId, setDraggingId }: { taskList: TaskList, editTaskId: number | null, setEditTaskId: React.Dispatch<React.SetStateAction<number | null>>, setTaskLists: React.Dispatch<React.SetStateAction<TaskList[]>>, BoardId: number, enterTaskListId: number | null, setEnterTaskListId: React.Dispatch<React.SetStateAction<number | null>>, openMenuId: number | null, setOpenMenuId: React.Dispatch<React.SetStateAction<number | null>>, taskLists: TaskList[], editTaskListId: number | null, setEditTaskListId: React.Dispatch<React.SetStateAction<number | null>>, draggingId: number | null, setDraggingId: React.Dispatch<React.SetStateAction<number | null>> }) {

    return (
        <DraggableTaskList className="rounded w-60 bg-gray-100 flex-none p-2 flex flex-col gap-2 z-10" setEditTaskListId={setEditTaskListId} setTaskLists={setTaskLists} boardId={boardId} taskLists={taskLists} element={taskList} draggingId={draggingId} setDraggingId={setDraggingId}>
            <div className="flex flex-row justify-between items-center">
                <EditTaskListName boardId={boardId!} taskList={taskList} editTaskListId={editTaskListId} setEditTaskListId={setEditTaskListId} setTaskLists={setTaskLists} />
                <TaskListMenu taskList={taskList} boardId={boardId} setTaskLists={setTaskLists} openMenuId={openMenuId} setOpenMenuId={setOpenMenuId} />
            </div>
            {taskList.tasks && taskList.tasks.map((task: Task) => (
                <div id={`task-${task.id}`} key={task.id}>
                    <TaskCard task={task} taskList={taskList} setTaskLists={setTaskLists} setEditTaskId={setEditTaskId} id={boardId} taskLists={taskLists} editTaskId={editTaskId} />
                </div>
            )
            )
            }
            <AddNewTask enterTaskListId={enterTaskListId} setEnterTaskListId={setEnterTaskListId} taskList={taskList} boardId={boardId} setTaskLists={setTaskLists} />
        </DraggableTaskList>
    )
}
