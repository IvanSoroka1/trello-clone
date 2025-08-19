import { use, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import NameAndInput, { NameAndInputPreview } from "../components/NameAndInput";
import { List, X } from "lucide-react";
import { FiMoreHorizontal } from "react-icons/fi";
import { FaCheckCircle, FaRegCircle, FaEdit, FaCheck, FaRegTrashAlt } from "react-icons/fa";


interface Board {
    id: string;
    name: string;
    taskLists: TaskList[];
}

interface TaskList {
    id: number;
    name: string;
    tasks: Task[];
    position: number;
}

interface Task {
    id: number;
    name: string;
    completed: boolean;
    position: number;
}

export default function Board() {

    const [taskLists, setTaskLists] = useState<TaskList[]>([]);
    const location = useLocation();
    const boardName = location.state?.boardName || "Board Name"; // but if you have a bookmark for the page, you're going to need to look in the database for the name of the board
    const { id } = useParams();
    const navigate = useNavigate();
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [enterTaskListId, setEnterTaskListId] = useState<number | null>(null);

    useEffect(() => {
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

                // for (const i in data.message) {
                //     for (const j in data.message) {
                //         if (data.message[j].position == i) {
                //             const copy = data.message[i];
                //             data.message[i] = data.message[j];
                //             data.message[j] = copy;
                //         }
                //     }
                // }
                data.message.sort((a: TaskList, b: TaskList) => a.position - b.position);

                for(const i in data.message) {
                    data.message[i].tasks.sort((a: Task, b: Task) => a.position - b.position);
                }

                setTaskLists(data.message);

                console.log("Success! Board data:", data);
            })
        } catch (e) {
            console.log(e);
        }
    }, []);

    useEffect(() => {
        const closeMenu = (e: MouseEvent) => {
            setOpenMenuId(null);
        };
        if (openMenuId !== null) {
            document.addEventListener("click", closeMenu);
        }
        return () => { document.removeEventListener("click", closeMenu); };
    }, [openMenuId])


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
                setEnterTaskListId(null);
                setTaskName('');
            }

        } catch (e) {
            console.log(e);
        }
    }
    const editTaskName = async (taskListId: number) => {
        try {
            if (editTaskId === null) return; // No task list is selected

            const response = await fetch("http://localhost:5235/api/tasks/edittask", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    TaskId: editTaskId,
                    TaskName: taskName,
                    ListId: taskListId,
                    BoardId: id
                }),
                credentials: "include"
            });
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
                setEditTaskId(null);
                setTaskName('');
            }

        } catch (e) {
            console.log(e);
        }
    }
    const deleteTask = async (taskId: number, taskListId: number) => {
        try {
            const response = await fetch("http://localhost:5235/api/tasks/deletetask", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    TaskId: taskId,
                    ListId: taskListId,
                    BoardId: id
                }),
                credentials: "include"
            });
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

    const editTaskListPosition = async (index1: number, index2: number) => {
        try {
            const response = await fetch("http://localhost:5235/api/tasks/edittasklistposition", {
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
    const editTaskPosition = async (index1: number, index2: number, taskListId: number) => {
        try {
            const response = await fetch("http://localhost:5235/api/tasks/edittaskposition", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    Index1: index1,
                    Index2: index2,
                    ListId: taskListId,
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

    const clickDownTaskList = (e: React.MouseEvent<HTMLDivElement>, taskListId: number) => {
        const rect = e.currentTarget.getBoundingClientRect();

        // const offsetX = e.clientX - rect.left;
        // const offsetY = e.clientY - rect.top;
        // setPosition({ x: offsetX, y: offsetY });
        setOriginalCoordinates({ x: rect.left, y: rect.top });
        setOriginalPosition({ x: e.clientX, y: e.clientY });
        setOriginalTaskListId(taskListId);
    }

    const moveTaskList = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!originalPosition) return;
        if (!originalCoordinates) return;
        const offsetX = e.clientX - originalPosition.x;
        const offsetY = e.clientY - originalPosition.y;
        setPosition({ x: offsetX, y: offsetY });
    }

    const releaseTaskList = (e: React.MouseEvent<HTMLDivElement>, type: string = "tasklist-", taskList?: TaskList) => {
        setPosition(null);
        setOriginalPosition(null);
        setOriginalCoordinates(null);
        setDraggingTaskListId(null);
        setDraggingTaskId(null);
        //const id = e.currentTarget.

        if (!originalTaskListId) return;

        // Get all elements under the cursor
        const elements = document.elementsFromPoint(e.clientX, e.clientY);

        // Find the first card under the cursor that isn’t the dragged one
        const targetEl = elements.find(
            el => el.id?.startsWith(type) && el.id !== `${type}${originalTaskListId}`
        );

        if (targetEl) {
            const targetId = parseInt(targetEl.id.replace(type, ""), 10);

            if (type === "tasklist-") {
                const index1 = taskLists.findIndex(list => list.id === targetId);
                const index2 = taskLists.findIndex(list => list.id === originalTaskListId);

                setTaskLists(prev => {
                    const newTaskLists = [...prev];
                    if (index1 !== -1 && index2 !== -1) {
                        const copy = newTaskLists[index1];
                        newTaskLists[index1] = newTaskLists[index2];
                        newTaskLists[index2] = copy;
                    }
                    return newTaskLists;
                });
                editTaskListPosition(index1, index2);
            }
            else if (taskList !== undefined) {
                const index1 = taskList.tasks.findIndex(task => task.id === targetId);
                const index2 = taskList.tasks.findIndex(task => task.id === originalTaskListId);

                setTaskLists(prev => {
                    const newTaskLists = [...prev];
                    const taskListIndex = newTaskLists.findIndex(list => list.id === taskList.id);
                    if (taskListIndex !== -1 && index1 !== -1 && index2 !== -1) {
                        // const newTasks = [...newTaskLists[taskListIndex].tasks];
                        // const copy = newTasks[index1];
                        // newTasks[index1] = newTasks[index2];
                        // newTasks[index2] = copy;
                        // newTaskLists[taskListIndex].tasks = newTasks;

                        const newTasks = [...newTaskLists[taskListIndex].tasks];
                        // Reorder deterministically (no matter how many times this runs)
                        const reordered = newTasks.map((t, i) => {
                            if (i === index1) return newTasks[index2];
                            if (i === index2) return newTasks[index1];
                            return t;
                        });
                        newTaskLists[taskListIndex] = {
                            ...newTaskLists[taskListIndex],
                            tasks: reordered,
                        };
                        //newTaskLists[taskListIndex].tasks = reordered;
                    }
                    return newTaskLists;
                })
                editTaskPosition(index1, index2, taskList.id);

            }

        }
        setOriginalTaskListId(null);
    }

    // const clickDownTask(){

    // }

    const [originalTaskListId, setOriginalTaskListId] = useState<number | null>(null);
    const [originalPosition, setOriginalPosition] = useState<{ x: number; y: number } | null>(null);
    const [originalCoordinates, setOriginalCoordinates] = useState<{ x: number; y: number } | null>(null);
    const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
    const [draggingTaskListId, setDraggingTaskListId] = useState<number | null>(null);
    const [draggingTaskId, setDraggingTaskId] = useState<number | null>(null);

    const [createListPrompt, setCreateListPrompt] = useState(false);
    const [listName, setListName] = useState('');
    const [taskName, setTaskName] = useState('');
    const [listHeight, setListHeight] = useState(20);
    const [editTaskId, setEditTaskId] = useState<number | null>(null);

    return (
        <div>
            <div className="flex justify-center items-center p-2 border-b">
                {boardName}
            </div>
            {/* Fix the scrollbar to be at the bottom of the screen */}
            <div className="overflow-x-auto whitespace-nowrap flex gap-2 px-2 mt-2 items-start h-screen">
                {
                    taskLists.map(taskList => (
                        <div id={`tasklist-${taskList.id}`} key={taskList.id}
                            onMouseDown={(e) => { clickDownTaskList(e, taskList.id); setDraggingTaskListId(taskList.id) }} onMouseMove={moveTaskList} onMouseUp={(e) => releaseTaskList(e)} className={`relative rounded w-60 bg-gray-100 flex-none p-2 flex flex-col gap-2 ${draggingTaskListId === taskList.id ? 'opacity-50 z-50' : ''}`} style={position && draggingTaskListId === taskList.id ? { left: position.x, top: position.y } : {}} >
                            <div onMouseDown={(e) => { e.stopPropagation(); }} onClick={e => { e.stopPropagation(); setOpenMenuId(taskList.id) }} className="rounded absolute top-0 right-0 w-8 h-8 flex justify-center items-center">
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
                                <div id={`task-${task.id}`} key={task.id}>
                                    {editTaskId === task.id ? (
                                        <div>

                                            <div className="fixed z-10 top-0 left-0 w-screen h-screen bg-black opacity-50"> </div>
                                            <div className="relative z-50">

                                                <input type="text" value={taskName} onChange={e => setTaskName(e.target.value)} className="rounded p-1 bg-white shadow-lg" />

                                                <div className="flex gap-2 items-center">
                                                    <FaCheck onClick={() => editTaskName(taskList.id)} className="text-green-500" /><X className="text-red-500" onClick={() => { setEditTaskId(null) }} />

                                                </div>
                                            </div>
                                        </div>

                                    ) : (
                                        <div onMouseDown={(e) => { clickDownTaskList(e, task.id); setDraggingTaskId(task.id); e.stopPropagation(); }} onMouseMove={(e) => { moveTaskList(e); e.stopPropagation(); }} onMouseUp={(e) => { releaseTaskList(e, 'task-', taskList); e.stopPropagation(); }} className={`relative flex items-center gap-1 rounded shadow-lg bg-white p-2 hover:border-blue-500 ${draggingTaskId === task.id ? 'opacity-50 z-50' : ''}`} style={position && draggingTaskId === task.id ? { left: position.x, top: position.y } : {}} >
                                            <ToggleCheckIcon completed={task.completed} taskId={task.id} listId={taskList.id} boardId={id}></ToggleCheckIcon>
                                            {task.name}
                                            <div className="flex text-gray-500 absolute right-2 gap-2">
                                                <FaRegTrashAlt onClick={() => { deleteTask(task.id, taskList.id); }} className="hover:text-black"></FaRegTrashAlt>
                                                <FaEdit onClick={() => { setEditTaskId(task.id); setTaskName(task.name); }} className=" hover:text-black"></FaEdit>
                                            </div>
                                        </div>
                                    )
                                    }

                                </div>
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
                                        <button onClick={newTask} className="border rounded p-2">Add Task +</button>
                                        <button className="rounded" onClick={() => { setEnterTaskListId(null); setTaskName(""); }}><X></X></button>
                                    </div>
                                </div>
                            }
                        </div>
                    ))
                }

                {
                    !createListPrompt &&
                    <button onClick={() => setCreateListPrompt(true)} className="py-2 justify-center shadow-lg items-center order rounded w-60 flex-none">+ Create a new list</button>
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



function ToggleCheckIcon({ taskId, listId, boardId, completed }: { taskId: number, listId: number, boardId: string | undefined, completed: boolean }) {
    const [isChecked, setIsChecked] = useState(completed);

    const handleClick = () => {
        setIsChecked(!isChecked);
        try {
            fetch("http://localhost:5235/api/tasks/togglecheck", {
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
            });
        } catch (e) {
            console.error("Error toggling task completion:", e);
        }
    }

    return (
        <div onClick={handleClick} className={`${isChecked ? 'text-green-500' : ''}`}>
            {isChecked && < FaCheckCircle />}
            {!isChecked && <FaRegCircle />}
        </div>
    )
}