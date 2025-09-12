import { useEffect, useRef } from "react";

type AutoResizeTextareaProps<T> = {
    taskName: string;
    setTaskName: React.Dispatch<React.SetStateAction<string>>;
    editFunction: () => void;
    setId: React.Dispatch<React.SetStateAction<T>>;
    bold: boolean;
};

export function AutoResizeTextarea<T extends number | null | boolean>({
    taskName,
    setTaskName,
    editFunction,
    setId,
    bold
}: AutoResizeTextareaProps<T>) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const el = textareaRef.current;
        if (el) {
            el.style.height = "0px";
            el.style.height = el.scrollHeight + "px";
        }
    }, [taskName]);

    return (
        <textarea
            style={{ boxSizing: "border-box", overflowY: "hidden" }}
            onMouseDown={(e) => e.stopPropagation()}
            ref={textareaRef}
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className={`resize-none overflow-hidden break-all rounded p-1 bg-white shadow-lg w-full ${bold ? 'font-semibold' : ''}`}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    editFunction();
                } else if (e.key === "Escape") {
                    editFunction();
                }
            }}
            onBlur={() => {
                if (typeof (false as T) === "boolean") {
                    (setId as React.Dispatch<React.SetStateAction<boolean>>)(false);
                } else {
                    (setId as React.Dispatch<React.SetStateAction<number | null>>)(null);
                }
            }}
            autoFocus
            placeholder="Enter Task Name..."
        />
    );
}
