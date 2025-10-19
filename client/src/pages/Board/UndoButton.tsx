import { FaUndo, FaTrash } from "react-icons/fa";

interface UndoButtonProps {
    pendingDeletion: any;
    undoTimer: number;
    onUndo: () => void;
    taskName: string;
}

export function UndoButton({ pendingDeletion, undoTimer, onUndo, taskName }: UndoButtonProps) {
    if (!pendingDeletion) return null;

    return (
        <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-lg  p-4 flex items-center gap-3 z-50 transition-all duration-300">
            <FaTrash className="text-red-500" />
            <div className="flex-1">
                <p className="text-sm font-medium">Delete "{taskName}"?</p>
                <p className="text-xs text-gray-500">
                    {undoTimer > 0 ? `Deleting in ${undoTimer} seconds...` : "Press Undo to cancel"}
                </p>
            </div>
            <div className="flex gap-2">
                {undoTimer > 0 && (
                    <button
                        onClick={onUndo}
                        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm flex items-center gap-1 transition-colors"
                    >
                        <FaUndo size={12} />
                        Undo
                    </button>
                )}
            </div>
        </div>
    );
}