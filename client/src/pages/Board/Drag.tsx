import { useRef } from "react";
import { type TaskList } from "./TaskList.tsx";
import { type Task } from "./Task.tsx";
//import {editTaskPosition, deleteTask, insertTask} from "./Task.tsx"
//import {editTaskListPosition} from "./TaskList.tsx"
import { setUpApiTasks } from "./Task.tsx";
import { setUpApiTaskList } from "./TaskList.tsx"
import React from "react";
import { useNavigate } from "react-router-dom";

export function DraggableTaskList({
    setTaskLists,
    boardId,
    taskLists,
    children,
    element,
    setEditTaskListId,

}: {
    setTaskLists: React.Dispatch<React.SetStateAction<TaskList[]>>,
    boardId: number,
    taskLists: TaskList[],
    children: React.ReactNode,
    element: TaskList,
    setEditTaskListId: React.Dispatch<React.SetStateAction<number | null>>,

}) {
    const draggingElementIdRef = useRef<number | null>(null);
    const originalPositionRef = useRef<{ x: number; y: number } | null>(null);
    const elementRef = useRef<HTMLDivElement | null>(null);
    const clickedHandleRef = useRef<boolean>(false);
    const navigate = useNavigate();

    const clickDownElement = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!(e.target as HTMLElement).closest(".drag-handle")) {
            return;
        }
        else
            clickedHandleRef.current = true;

        originalPositionRef.current = { x: e.clientX, y: e.clientY };
        e.currentTarget.setPointerCapture(e.pointerId);

        if (elementRef.current) {
            elementRef.current.style.transition = "none"; // no lag while dragging
        }
    };

    const moveElement = (e: React.PointerEvent<HTMLDivElement>, elementId: number) => {
        if(!elementRef.current)
            return;
        if (!originalPositionRef.current) return;

        const offsetX = e.clientX - originalPositionRef.current.x;
        const offsetY = e.clientY - originalPositionRef.current.y;
        if(!draggingElementIdRef.current && offsetX*offsetX + offsetY*offsetY > 50)
            draggingElementIdRef.current = elementId; 

        if (elementRef.current && draggingElementIdRef.current === element.id) {
            elementRef.current.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
            elementRef.current.style.zIndex = '';
            elementRef.current.style.opacity = '0.6';
        }
    };

    const releaseElement = (e: React.PointerEvent<HTMLDivElement>, element: TaskList) => {
        originalPositionRef.current = null;
        if(clickedHandleRef.current === true && !draggingElementIdRef.current){
            clickedHandleRef.current = false;
            setEditTaskListId(element.id);
            if(elementRef.current)
                elementRef.current.releasePointerCapture(e.pointerId);
            return;
        }


        const { editTaskListPosition } = setUpApiTaskList(boardId, setTaskLists, ["editTaskListPosition"], navigate);
        // Smoothly reset transform
        if (elementRef.current) {
            // elementRef.current.style.transition = "transform 150ms ease"; this can create a problem when you drag to another task list and was deleted for task dragging as well (it does the animation from some random place.) Although it looks nice when you do an invalid drag.
            elementRef.current.style.transform = "";
            elementRef.current.style.zIndex = '';
            elementRef.current.style.opacity = '1';
            elementRef.current.releasePointerCapture(e.pointerId);
        }

        // Get all elements under cursor
        const elements = document.elementsFromPoint(e.clientX, e.clientY);
        const type = "tasklist-";
        const targetEl = elements.find(
            el => el.id?.startsWith(type) && el.id !== `${type}${draggingElementIdRef.current}`
        );

        if (targetEl) {
            const targetId = parseInt(targetEl.id.replace(type, ""), 10);
            if (targetId === element.id) return;
            const index1 = taskLists.findIndex(list => list.id === targetId);
            const index2 = taskLists.findIndex(list => list.id === draggingElementIdRef.current);

            setTaskLists(prev => {
                const newTaskLists = [...prev];
                if (index1 !== -1 && index2 !== -1) {
                    const copy = newTaskLists[index1];
                    newTaskLists[index1] = newTaskLists[index2];
                    newTaskLists[index2] = copy;
                }
                return newTaskLists;
            });
            editTaskListPosition?.(index1, index2);
        }

    };

    // Reset refs
    clickedHandleRef.current = false;
    draggingElementIdRef.current = null;

    return (
        <div
            ref={elementRef}
            id={`tasklist-${element.id}`}
            key={element.id}
            onPointerDown={(e) => {clickDownElement(e); e.stopPropagation(); }}
            onPointerMove={(e) => { moveElement(e, element.id); e.stopPropagation(); }}
            onPointerUp={(e) => { releaseElement(e, element); e.stopPropagation(); }}
            className={`relative rounded w-60 bg-gray-100 flex-none p-2 flex flex-col gap-2 z-10`}
        >
            {children}
            {/*React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    const childElement = child as React.ReactElement<any>;

                    // only wrap if child has onClick
                    if (typeof childElement.props.onClick === "function") {
                        const existingPointerDown = childElement.props.onPointerDown;

                        return React.cloneElement(childElement, {
                            onPointerDown: (e: React.PointerEvent) => {
                                e.stopPropagation();
                                if (typeof existingPointerDown === "function") {
                                    existingPointerDown(e);
                                }
                            },
                        });
                    }
                }
                return child;
            })*/}
        </div>
    );
}



export function DraggableTask({
    setTaskLists,
    boardId,
    taskLists,
    children,
    task,
    taskList,
    className,
}: {
    setTaskLists: React.Dispatch<React.SetStateAction<TaskList[]>>,
    boardId: number,
    taskLists: TaskList[],
    children: React.ReactNode,
    task: Task,
    taskList: TaskList,
    className: string,
}) {
    const elementRef = useRef<HTMLDivElement | null>(null);
    const positionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const originalPositionRef = useRef<{ x: number; y: number } | null>(null);
    const frameRef = useRef<number | null>(null);
    const navigate = useNavigate();

    // Pointer down: start dragging
    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!(e.target as HTMLElement).closest(".drag-handle")) {
            return;
        }
        e.stopPropagation();
        originalPositionRef.current = { x: e.clientX, y: e.clientY };
        elementRef.current?.setPointerCapture(e.pointerId);
        if (elementRef.current) {
            elementRef.current.style.transition = "none"; // no lag while dragging
        }
    };

    // Pointer move: update position
    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!originalPositionRef.current) return;

        const offsetX = e.clientX - originalPositionRef.current.x;
        const offsetY = e.clientY - originalPositionRef.current.y;
        positionRef.current = { x: offsetX, y: offsetY };

        if (frameRef.current === null) {
            frameRef.current = requestAnimationFrame(() => {
                if (elementRef.current) {
                    elementRef.current.style.transform = `translate(${positionRef.current.x}px, ${positionRef.current.y}px)`;
                    elementRef.current.style.zIndex = '';
                    elementRef.current.style.opacity = '0.6';
                }
                frameRef.current = null;
            });
        }
    };

    // Pointer up: drop
    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (frameRef.current) {
            cancelAnimationFrame(frameRef.current);
            frameRef.current = null;
        }

        // Reset visuals
        if (elementRef.current) {
            //elementRef.current.style.transition = "transform 150ms ease";
            elementRef.current.style.transform = 'translate(0,0)';
            elementRef.current.style.zIndex = '';
            elementRef.current.style.opacity = '1';
            elementRef.current.releasePointerCapture(e.pointerId);
        }

        const startPos = originalPositionRef.current;
        if (!startPos) return;

        // Determine drop target
        const elements = document.elementsFromPoint(e.clientX, e.clientY);
        const type = 'task-';
        const targetEl = elements.find(
            el => el.id?.startsWith(type) && el.id !== `task-${task.id}`
        );

        if (!targetEl) {
            originalPositionRef.current = null;
            return;
        }

        const targetId = parseInt(targetEl.id.replace(type, ''), 10);

        // Find target task list if any
        const targetTaskListEl = elements.find(
            el => el.id?.startsWith('tasklist-') && el.id !== `tasklist-${taskList.id}`
        );
        let targetTaskListId: number | null = null;
        if (targetTaskListEl) targetTaskListId = parseInt(targetTaskListEl.id.replace('tasklist-', ''), 10);

        let targetTaskList = targetTaskListId !== null
            ? taskLists.find(list => list.id === targetTaskListId) ?? taskList
            : taskList;

        const originalTaskList = taskLists.find(list => list.id === taskList.id);
        if (!originalTaskList || !targetTaskList) return;

        const index1 = targetTaskList.tasks.findIndex(t => t.id === targetId);
        const index2 = originalTaskList.tasks.findIndex(t => t.id === task.id);

        const { editTaskPosition, deleteTask, insertTask } = setUpApiTasks(boardId, setTaskLists, ["editTaskPosition", "deleteTask", "insertTask"], navigate);

        if (targetTaskList === originalTaskList) {
            // Reorder within same list
            setTaskLists(prev => {
                const newTaskLists = [...prev];
                const listIndex = newTaskLists.findIndex(l => l.id === taskList.id);
                if (listIndex !== -1 && index1 !== -1 && index2 !== -1) {
                    const newTasks = [...newTaskLists[listIndex].tasks];
                    [newTasks[index1], newTasks[index2]] = [newTasks[index2], newTasks[index1]];
                    newTaskLists[listIndex] = { ...newTaskLists[listIndex], tasks: newTasks };
                }
                return newTaskLists;
            });
            editTaskPosition?.(index1, index2, taskList.id);
        } else {
            // Move between lists
            deleteTask?.(task.id, originalTaskList.id);
            setTaskLists(prev => {
                const newTaskLists = [...prev];
                const listIndex = newTaskLists.findIndex(l => l.id === targetTaskList!.id);
                if (listIndex !== -1 && index1 !== -1 && index2 !== -1) {
                    const newTasks = [
                        ...newTaskLists[listIndex].tasks.slice(0, index1),
                        originalTaskList.tasks[index2],
                        ...newTaskLists[listIndex].tasks.slice(index1)
                    ];
                    newTaskLists[listIndex] = { ...newTaskLists[listIndex], tasks: newTasks };
                }
                return newTaskLists;
            });
            insertTask?.(index1, targetTaskList!.id, originalTaskList.tasks[index2]);
        }

        originalPositionRef.current = null;
    };

    return (
        <div
            ref={elementRef}
            id={`task-${task.id}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className={className}
        >
            {children}
        </div>
    );
}

