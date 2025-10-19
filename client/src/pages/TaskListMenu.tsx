import { useNavigate } from "react-router-dom";
import type { TaskList } from "./Board/TaskList";
import { useEffect, useRef, useState } from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import { createPortal } from "react-dom";
import { setUpApiTaskList } from "./Board/TaskList";

export function TaskListMenu({
    taskList,
    boardId,
    setTaskLists,
    openMenuId,
    setOpenMenuId,
}: {
    taskList: TaskList;
    boardId: number;
    setTaskLists: React.Dispatch<React.SetStateAction<TaskList[]>>;
    openMenuId: number | null;
    setOpenMenuId: React.Dispatch<React.SetStateAction<number | null>>;
}) {
    const navigate = useNavigate();
    const { deleteTaskList } = setUpApiTaskList(
        boardId,
        setTaskLists,
        ["deleteTaskList"],
        navigate
    );

    const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const buttonRef = useRef<HTMLDivElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);

    // update position when menu opens
    useEffect(() => {
        if (openMenuId === taskList.id && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + window.scrollY, // below button
                left: rect.left + window.scrollX,  // aligned to left
            });
        }
    }, [openMenuId, taskList.id]);

    // close menu when user clicks outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
                setOpenMenuId(null);
            }
        }

        if (openMenuId !== null) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [openMenuId]);

    return (
        <div
            ref={buttonRef}
            style={{ width: "1.5rem", height: "1.5rem" }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId(openMenuId !== taskList.id ? taskList.id : null);
            }}
            className="relative rounded flex justify-center items-center hover:bg-gray-200"
            onBlur={() => setOpenMenuId(null)}
        >
            <FiMoreHorizontal size={16} />

            {openMenuId === taskList.id &&
                createPortal(
                    <div
                        ref={menuRef}
                        className="shadow rounded text-white-500 w-70 bg-white absolute z-[99999]"
                        style={{
                            top: position.top,
                            left: position.left,
                            position: "absolute",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-center py-2 font-semibold">
                            List Actions
                        </div>
                        <button
                            onClick={() => deleteTaskList?.(openMenuId)}
                            className="rounded px-2 text-red-500 flex justify-left w-full"
                        >
                            Delete
                        </button>
                    </div>,
                    document.body
                )}
        </div>
    );
}