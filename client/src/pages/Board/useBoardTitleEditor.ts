import { useEffect, useState } from "react";
import type { Location, NavigateFunction } from "react-router-dom";
import { fetchWithRefresh } from "../../Refresh.tsx";

type UseBoardTitleEditorArgs = {
    initialTitle: string;
    boardId: string | undefined;
    navigate: NavigateFunction;
    location: Location;
};

type UseBoardTitleEditorResult = {
    displayedBoardTitle: string;
    boardTitleDraft: string;
    isEditingBoardTitle: boolean;
    setIsEditingBoardTitle: React.Dispatch<React.SetStateAction<boolean>>;
    isSavingBoardTitle: boolean;
    boardTitleError: string | null;
    handleStartEditingBoardTitle: () => void;
    handleRenameBoard: () => Promise<void>;
    handleBoardTitleDraftChange: React.Dispatch<React.SetStateAction<string>>;
};

export function useBoardTitleEditor({
    initialTitle,
    boardId,
    navigate,
    location
}: UseBoardTitleEditorArgs): UseBoardTitleEditorResult {
    const [displayedBoardTitle, setDisplayedBoardTitle] = useState(initialTitle);
    const [boardTitleDraft, setBoardTitleDraft] = useState(initialTitle);
    const [isEditingBoardTitle, setIsEditingBoardTitle] = useState(false);
    const [isSavingBoardTitle, setIsSavingBoardTitle] = useState(false);
    const [boardTitleError, setBoardTitleError] = useState<string | null>(null);

    useEffect(() => {
        setDisplayedBoardTitle(initialTitle);
        if (!isEditingBoardTitle) {
            setBoardTitleDraft(initialTitle);
        }
    }, [initialTitle, isEditingBoardTitle]);

    const handleStartEditingBoardTitle = () => {
        if (isSavingBoardTitle)
            return;

        setBoardTitleDraft(displayedBoardTitle);
        setBoardTitleError(null);
        setIsEditingBoardTitle(true);
    };

    const handleBoardTitleDraftChange: React.Dispatch<React.SetStateAction<string>> = (value) => {
        if (typeof value === "function") {
            setBoardTitleDraft((prev) => {
                const nextValue = value(prev);
                setBoardTitleError(null);
                return nextValue;
            });
            return;
        }

        setBoardTitleDraft(value);
        setBoardTitleError(null);
    };

    const handleRenameBoard = async () => {
        if (isSavingBoardTitle)
            return;

        const trimmedTitle = boardTitleDraft.trim();

        if (!trimmedTitle.length) {
            setBoardTitleError("Board name cannot be empty");
            return;
        }

        if (!boardId) {
            setBoardTitleError("Board identifier is missing");
            return;
        }

        const parsedBoardId = parseInt(boardId, 10);
        if (Number.isNaN(parsedBoardId)) {
            setBoardTitleError("Board identifier is invalid");
            return;
        }

        if (trimmedTitle === displayedBoardTitle) {
            setIsEditingBoardTitle(false);
            setBoardTitleError(null);
            return;
        }

        try {
            setIsSavingBoardTitle(true);
            const response = await fetchWithRefresh(`${import.meta.env.VITE_API_URL}/api/dashboard/board`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    boardId: parsedBoardId,
                    title: trimmedTitle
                })
            }, navigate);

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                setBoardTitleError(errorData?.message ?? "Failed to rename board");
                return;
            }

            const data = await response.json().catch(() => ({} as { title?: string }));
            const updatedTitle = data.title ?? trimmedTitle;

            setDisplayedBoardTitle(updatedTitle);
            setBoardTitleDraft(updatedTitle);
            setBoardTitleError(null);
            setIsEditingBoardTitle(false);

            const currentState = (typeof location.state === "object" && location.state !== null)
                ? location.state as Record<string, unknown>
                : {};

            navigate(".", {
                replace: true,
                state: { ...currentState, boardName: updatedTitle }
            });
        } catch (error) {
            console.error("Failed to rename board", error);
            setBoardTitleError("Failed to rename board");
        } finally {
            setIsSavingBoardTitle(false);
        }
    };

    return {
        displayedBoardTitle,
        boardTitleDraft,
        isEditingBoardTitle,
        setIsEditingBoardTitle,
        isSavingBoardTitle,
        boardTitleError,
        handleStartEditingBoardTitle,
        handleRenameBoard,
        handleBoardTitleDraftChange
    };
}
