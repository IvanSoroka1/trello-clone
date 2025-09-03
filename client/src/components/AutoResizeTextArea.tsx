import { useRef, useEffect } from "react"

export function AutoResizeTextarea({ taskName, setTaskName, editFunction, setId, bold }: { taskName: string, setTaskName: React.Dispatch<React.SetStateAction<string>>, editFunction: () => void, setId: React.Dispatch<React.SetStateAction<number | null>> | undefined, bold: boolean }) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Adjust height on content change
    useEffect(() => {
        const el = textareaRef.current;
        if (el) {
            // el.style.height = "auto"; // reset first
            // const lineHeight = parseInt(getComputedStyle(el).lineHeight || "16", 10);
            // el.style.height = `${el.scrollHeight - lineHeight}px`; // remove one line
            //el.style.height = `${el.scrollHeight}px`; 
            el.style.height = "0px"; // fully reset
            el.style.height = el.scrollHeight + "px"; // fit to content
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
                    e.preventDefault();   // stop newline
                    editFunction();
                } else if (e.key === "Escape") {
                    editFunction();
                }
            }}
            onBlur={() => setId !== null && setId !== undefined ? setId(null) : undefined}
            autoFocus
            placeholder="Enter Task Name..."
        />
    );
}