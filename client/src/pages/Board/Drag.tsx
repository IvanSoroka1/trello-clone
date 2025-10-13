import { useRef } from "react";
import { type TaskList } from "./TaskList.tsx";
import { type Task } from "./Task.tsx";
//import {editTaskPosition, deleteTask, insertTask} from "./Task.tsx"
//import {editTaskListPosition} from "./TaskList.tsx"
import { setUpApiTasks } from "./Task.tsx";
import { setUpApiTaskList } from "./TaskList.tsx"
import React from "react";
import { useNavigate } from "react-router-dom";

interface DraggableTaskListProps {
    element: TaskList;
    taskLists: TaskList[];
    setTaskLists: React.Dispatch<React.SetStateAction<TaskList[]>>;
    boardId: number;
    className: string;
    setEditTaskListId: React.Dispatch<React.SetStateAction<number | null>>;
    draggingId: number | null;
    setDraggingId: React.Dispatch<React.SetStateAction<number | null>>;
    children: React.ReactNode;
}


interface DraggableTaskListProps {
    element: TaskList;
    taskLists: TaskList[];
    setTaskLists: React.Dispatch<React.SetStateAction<TaskList[]>>;
    boardId: number;
    className: string;
    setEditTaskListId: React.Dispatch<React.SetStateAction<number | null>>;
    editTaskListId: number | null;
    children: React.ReactNode;
}


interface DraggableTaskListProps {
    element: TaskList;
    taskLists: TaskList[];
    setTaskLists: React.Dispatch<React.SetStateAction<TaskList[]>>;
    boardId: number;
    className: string;
    setEditTaskListId: React.Dispatch<React.SetStateAction<number | null>>;
    children: React.ReactNode;
}

export function DraggableTaskList({
    element,
    taskLists,
    setTaskLists,
    boardId,
    className,
    setEditTaskListId,
    editTaskListId,
    children
}: DraggableTaskListProps) {
    const elementRef = useRef<HTMLDivElement | null>(null);
    const isDraggingRef = useRef(false);
    const navigate = useNavigate();
    const clickedHandle = useRef(false);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {

        clickedHandle.current = !!(e.target as HTMLElement).closest(".drag-handle-tasklist");
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        if (!clickedHandle.current) {
            e.preventDefault(); // cancel drag
            return;
        }
        isDraggingRef.current = false;

        if (elementRef.current) elementRef.current.style.opacity = "0";
        e.dataTransfer.setData("text/plain", element.id.toString());
        e.dataTransfer.effectAllowed = "move";

        // Create floating drag preview
        const dragImage = elementRef.current!.cloneNode(true) as HTMLElement;
        dragImage.id = "temporary-drag-image";
        dragImage.style.position = "absolute";
        dragImage.style.top = "-9999px";
        dragImage.style.left = "-9999px";
        dragImage.style.width = `${elementRef.current!.offsetWidth}px`;
        dragImage.style.height = `${elementRef.current!.offsetHeight}px`;
        dragImage.style.opacity = "0.6";
        document.body.appendChild(dragImage);

        e.dataTransfer.setDragImage(dragImage, e.nativeEvent.offsetX, e.nativeEvent.offsetY);

        // Mark as dragging after small timeout (to distinguish click vs drag)
        setTimeout(() => (isDraggingRef.current = true), 5);
    };

    const handleDragEnd = () => {
        // Remove temporary drag image
        const dragImage = document.getElementById("temporary-drag-image");
        if (dragImage) dragImage.remove();
        isDraggingRef.current = false;
        clickedHandle.current = false;
        // Restore original element's visibility
        if (elementRef.current) elementRef.current.style.opacity = "1";
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();

        const draggedIdStr = e.dataTransfer.getData("text/plain");
        const draggedId = parseInt(draggedIdStr, 10);

        if (isNaN(draggedId) || draggedId === element.id) return;

        const index1 = taskLists.findIndex(list => list.id === element.id);
        const index2 = taskLists.findIndex(list => list.id === draggedId);

        if (index1 === -1 || index2 === -1) return;

        setTaskLists(prev => {
            const newTaskLists = [...prev];
            const tmp = newTaskLists[index1];
            newTaskLists[index1] = newTaskLists[index2];
            newTaskLists[index2] = tmp;
            return newTaskLists;
        });

        // Optional: persist positions via API
        const { editTaskListPosition } = setUpApiTaskList(boardId, setTaskLists, ["editTaskListPosition"], navigate);
        editTaskListPosition?.(index1, index2);
    };

    const handleClick = () => {
        // Only trigger edit if the user clicked without dragging
        if (!isDraggingRef.current && clickedHandle.current) {
            setEditTaskListId(element.id);
        }
    };

    return (
        <div
            ref={elementRef}
            id={`tasklist-${element.id}`}
            draggable={!(!clickedHandle.current || editTaskListId === element.id)} // not draggable if you didn't click on the handle, or if the list is being edited
            onPointerDown={handlePointerDown}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={handleClick}
            className={className}
        >
            {children}
        </div>
    );
}


interface DraggableTaskProps {
    setTaskLists: React.Dispatch<React.SetStateAction<TaskList[]>>;
    boardId: number;
    children: React.ReactNode;
    task: Task;
    taskList: TaskList;
    className: string;
    taskLists: TaskList[];
}

export function DraggableTask({
    setTaskLists,
    boardId,
    children,
    task,
    taskList,
    className,
    taskLists,
}: DraggableTaskProps) {
    const elementRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();
    const isDraggingRef = useRef(false);
    const dragStartAllowedRef = useRef(false);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        // allow drag only if pointer started on .drag-handle
        dragStartAllowedRef.current = !!(e.target as HTMLElement).closest(".drag-handle-task");
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (!dragStartAllowedRef.current) {
            // can't reliably cancel native drag after it's started on some browsers,
            // but this guard prevents things when pointerDown didn't allow dragging.
            e.preventDefault();
            return;
        }
        isDraggingRef.current = true;

        // Put the dragged task id into dataTransfer so drop targets can read it
        e.dataTransfer.setData("text/plain", task.id.toString());
        e.dataTransfer.effectAllowed = "move";

        // Make original element a grey placeholder
        if (elementRef.current) {
            //elementRef.current.style.backgroundColor = "#d3d3d3";
            //elementRef.current.style.color = "transparent";
            elementRef.current.style.opacity = "0";
        }

        // Create a floating drag preview (browser will render this above chrome)
        const dragImage = elementRef.current!.cloneNode(true) as HTMLElement;
        dragImage.id = "temporary-drag-image";
        dragImage.style.position = "absolute";
        dragImage.style.top = "-9999px";
        dragImage.style.left = "-9999px";
        dragImage.style.width = `${elementRef.current!.offsetWidth}px`;
        dragImage.style.height = `${elementRef.current!.offsetHeight}px`;
        dragImage.style.opacity = "0.85";
        document.body.appendChild(dragImage);

        e.dataTransfer.setDragImage(dragImage, e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    };

    const handleDragEnd = () => {
        isDraggingRef.current = false;

        // Restore original element's appearance
        if (elementRef.current) {
            //elementRef.current.style.backgroundColor = "";
            //elementRef.current.style.color = "";
            elementRef.current.style.opacity = "1";
        }

        // Remove temporary drag image if still present
        const dragImage = document.getElementById("temporary-drag-image");
        if (dragImage) dragImage.remove();
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        // needed to allow drop
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();

        const draggedIdStr = e.dataTransfer.getData("text/plain");
        const draggedId = parseInt(draggedIdStr, 10);
        if (isNaN(draggedId) || draggedId === task.id) return;

        // Find the source task list (the list that currently contains the dragged task)
        const sourceListIndex = taskLists.findIndex(l => l.tasks.some(t => t.id === draggedId));
        if (sourceListIndex === -1) {
            // nothing to do — dragged task not found
            return;
        }
        const sourceTaskList = taskLists[sourceListIndex];
        const targetTaskList = taskList; // this component's taskList is the drop target list

        const indexInSource = sourceTaskList.tasks.findIndex(t => t.id === draggedId);
        const indexInTarget = targetTaskList.tasks.findIndex(t => t.id === task.id);

        if (indexInSource === -1 || indexInTarget === -1) return;

        const { editTaskPosition, deleteTask, insertTask } = setUpApiTasks(
            boardId,
            setTaskLists,
            ["editTaskPosition", "deleteTask", "insertTask"],
            navigate
        );

        if (sourceTaskList.id === targetTaskList.id) {
            // Reorder within same list
            setTaskLists(prev => {
                const newLists = prev.map(l => ({ ...l, tasks: [...l.tasks] }));
                const li = newLists.findIndex(l => l.id === sourceTaskList.id);
                if (li === -1) return prev;
                const tasksCopy = newLists[li].tasks;
                [tasksCopy[indexInSource], tasksCopy[indexInTarget]] = [tasksCopy[indexInTarget], tasksCopy[indexInSource]];
                newLists[li] = { ...newLists[li], tasks: tasksCopy };
                return newLists;
            });
            editTaskPosition?.(indexInTarget, indexInSource, sourceTaskList.id);
        } else {
            // Move between lists:
            const movedTask = sourceTaskList.tasks[indexInSource];
            // 1) remove from source and 2) insert into target at indexInTarget

            setTaskLists(prev => {
                const newLists = prev.map(l => ({ ...l, tasks: [...l.tasks] }));
                const sIdx = newLists.findIndex(l => l.id === sourceTaskList.id);
                const tIdx = newLists.findIndex(l => l.id === targetTaskList.id);
                if (sIdx === -1 || tIdx === -1) return prev;

                newLists[tIdx].tasks.splice(indexInTarget, 0, movedTask);

                return newLists;
            });

            // Optionally persist server-side
            deleteTask?.(draggedId, sourceTaskList.id);
            insertTask?.(indexInTarget, targetTaskList.id, movedTask);
        }
    };

    return (
        <div
            ref={elementRef}
            id={`task-${task.id}`}
            draggable
            onPointerDown={handlePointerDown}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={className}
        >
            {children}
        </div>
    );
}
