import { fetchWithRefresh } from "../../Refresh.tsx";
import { useEffect, useState } from "react";
import TaskListCard from "./TaskList.tsx";
import type { TaskList } from "./TaskList.tsx";
import type { Task } from "./Task.tsx"
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AddNewList } from "./TaskList.tsx";
import ElipsesMenuButton from "./ElipsesMenuButton.tsx";
import { UndoButton } from "./UndoButton.tsx";
import { useUndoDelete } from "./useUndoDelete.ts";
import { useBoardTitleEditor } from "./useBoardTitleEditor.ts";
import { AutoResizeTextarea } from "../../components/AutoResizeTextArea.tsx";

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
    const initialBoardTitle = location.state?.boardName || "Board Name"; // but if you have a bookmark for the page, you're going to need to look in the database for the name of the board
    const {
        displayedBoardTitle,
        boardTitleDraft,
        isEditingBoardTitle,
        setIsEditingBoardTitle,
        isSavingBoardTitle,
        boardTitleError,
        handleStartEditingBoardTitle,
        handleRenameBoard,
        handleBoardTitleDraftChange
    } = useBoardTitleEditor({
        initialTitle: initialBoardTitle,
        boardId: id,
        navigate,
        location
    });
    const [enterTaskListId, setEnterTaskListId] = useState<number | null>(null); // so that only one list can have a task added to it at a time
    const [editTaskId, setEditTaskId] = useState<number | null>(null); // so that only one task of any list can be edited at a time
    const [editTaskListId, setEditTaskListId] = useState<number | null>(null); // so that only one taskList can be edited at a time
    const [openMenuId, setOpenMenuId] = useState<number | null>(null); // so that only one menu can be open at a time
    const [draggingId, setDraggingId] = useState<number | null>(null);
    const { pendingDeletion, undoTimer, handleScheduleDelete, handleUndoDelete } = useUndoDelete(taskLists, setTaskLists, parseInt(id!, 10), navigate);

    const findTaskName = (taskId: number, taskListId: number): string => {
        const taskList = taskLists.find(tl => tl.id === taskListId);
        if (taskList) {
            const task = taskList.tasks.find(t => t.id === taskId);
            return task ? task.name : "Task";
        }
        return "Task";
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-200 text-slate-900">
            <UndoButton
                pendingDeletion={pendingDeletion}
                undoTimer={undoTimer}
                onUndo={handleUndoDelete}
                taskName={pendingDeletion ? findTaskName(pendingDeletion.taskId, pendingDeletion.taskListId) : ''}
            />
            <div className="mx-auto flex w-full max-w-8xl flex-col px-4 py-6 sm:px-6 lg:px-8">
                <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-transparent bg-white/90 px-6 py-5 shadow-sm backdrop-blur transition hover:border-indigo-200">
                    <div className="flex min-w-0 flex-1 flex-col">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-400">
                            Board
                        </p>
                        <div className="mt-1 w-full text-left text-3xl font-semibold text-slate-800 sm:text-4xl">
                            {isEditingBoardTitle ? (
                                <AutoResizeTextarea<boolean>
                                    taskName={boardTitleDraft}
                                    setTaskName={handleBoardTitleDraftChange}
                                    editFunction={handleRenameBoard}
                                    setId={setIsEditingBoardTitle}
                                    bold={true}
                                />
                            ) : (
                                <div
                                    onClick={handleStartEditingBoardTitle}
                                    className="w-fit max-w-full truncate bg-transparent text-left text-inherit outline-none hover:bg-transparent focus:bg-transparent active:bg-transparent focus-visible:ring-2 focus-visible:ring-indigo-200 focus-visible:ring-offset-2"
                                >
                                    {displayedBoardTitle}
                                </div>
                            )}
                        </div>
                        {boardTitleError && (
                            <p className="mt-2 text-sm text-red-500">{boardTitleError}</p>
                        )}
                        {isSavingBoardTitle && !boardTitleError && (
                            <p className="mt-2 text-sm text-slate-400">Saving...</p>
                        )}
                        <p className="mt-3 text-sm text-slate-500">
                            Drag cards between lists, add new tasks, and keep your team aligned.
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                        <ElipsesMenuButton id={parseInt(id!, 10)} />
                    </div>
                </header>

                {loading ? (
                    <div className="mt-10 flex h-[60vh] items-center justify-center rounded-3xl border border-slate-200 bg-white/80 text-4xl text-slate-500 shadow-inner">
                        Loading...
                    </div>
                ) : (
                    <div className="mt-8 flex w-full gap-3 overflow-x-auto pb-6 items-start">
                        {
                            // some of the props that are being sent to TaskListCard are being used by the children of the TaskListCard but not the TaskListCard itself. Should I use a context to fix this?
                            taskLists.map(
                                (taskList: TaskList) => <TaskListCard
                                    key={taskList.id}
                                    taskList={taskList}
                                    setTaskLists={setTaskLists}
                                    editTaskId={editTaskId}
                                    setEditTaskId={setEditTaskId}
                                    BoardId={parseInt(id!, 10)}
                                    enterTaskListId={enterTaskListId}
                                    setEnterTaskListId={setEnterTaskListId}
                                    taskLists={taskLists}
                                    editTaskListId={editTaskListId}
                                    setEditTaskListId={setEditTaskListId}
                                    openMenuId={openMenuId}
                                    setOpenMenuId={setOpenMenuId}
                                    draggingId={draggingId}
                                    setDraggingId={setDraggingId}
                                    handleScheduleDelete={handleScheduleDelete}
                                    pendingDeletion={pendingDeletion}
                                />
                            )
                        }
                        <AddNewList boardId={parseInt(id!, 10)} setTaskLists={setTaskLists} />
                    </div>
                )}
            </div>
        </div >
    )

}
