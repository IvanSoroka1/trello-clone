import { useState, useEffect } from "react";
import { fetchWithRefresh } from "../../Refresh.tsx";

export interface PendingDeletion {
    taskId: number;
    taskListId: number;
    boardId: number;
}

export function useUndoDelete(
    _taskLists: any[],
    setTaskLists: any,
    boardId: number,
    navigate: any
) {
    const [pendingDeletion, setPendingDeletion] = useState<PendingDeletion | null>(null);
    const [undoTimer, setUndoTimer] = useState(0);

    // Timer for undo functionality
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (pendingDeletion) {
            setUndoTimer(5); // 5 seconds countdown
            interval = setInterval(() => {
                setUndoTimer(prev => {
                    if (prev <= 1) {
                        clearInterval(interval!);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [pendingDeletion]);

    useEffect(() => {
       if (undoTimer === 0) {
           handleConfirmDelete();
       } 
    }, [undoTimer]);

    const handleScheduleDelete = (taskId: number, taskListId: number) => {
        setPendingDeletion({ taskId, taskListId, boardId });
    };

    const handleUndoDelete = () => {
        if (pendingDeletion) {
            // Remove the deletion by restoring the task to the UI
            setTaskLists((prevTaskLists: any[]) =>
                prevTaskLists.map((taskList: any) => {
                    if (taskList.id === pendingDeletion.taskListId) {
                        return {
                            ...taskList,
                            tasks: [...taskList.tasks] // Keep the task but removal will happen in actual deletion
                        };
                    }
                    return taskList;
                })
            );
            setPendingDeletion(null);
            setUndoTimer(0);
        }
    };

    const handleConfirmDelete = async () => {
        if (pendingDeletion) {
            try {
                const response = await fetchWithRefresh(`${import.meta.env.VITE_API_URL}/api/tasks/deletetask`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        TaskId: pendingDeletion.taskId,
                        ListId: pendingDeletion.taskListId,
                        BoardId: pendingDeletion.boardId
                    }),
                    credentials: "include"
                }, navigate);

                if (response.ok) {
                    // Remove the task from the UI
                    setTaskLists((prevTaskLists: any[]) =>
                        prevTaskLists.map((taskList: any) => {
                            if (taskList.id === pendingDeletion.taskListId) {
                                return {
                                    ...taskList,
                                    tasks: taskList.tasks.filter((task: any) => task.id !== pendingDeletion.taskId)
                                };
                            }
                            return taskList;
                        })
                    );
                }
            } catch (e) {
                console.error("Delete failed:", e);
            } finally {
                setPendingDeletion(null);
                setUndoTimer(0);
            }
        }
    };

    return {
        pendingDeletion,
        undoTimer,
        handleScheduleDelete,
        handleUndoDelete,
        handleConfirmDelete
    };
}