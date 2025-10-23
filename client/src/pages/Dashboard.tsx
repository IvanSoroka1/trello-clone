import { fetchWithRefresh } from "../Refresh.tsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiLoader, FiPlus, FiX } from "react-icons/fi";
import UserButton from "../components/UserButton.tsx";

interface Board {
    id: number;
    title: string;
    date?: string | null;
}

export default function Dashboard() {
    const [boards, setBoards] = useState<Board[]>([]);
    const [loading, setLoading] = useState(true);
    const [popup, setPopup] = useState(false);
    const [name, setName] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;

        const loadBoards = async () => {
            try {
                const response = await fetchWithRefresh(
                    `${import.meta.env.VITE_API_URL}/api/dashboard/boards`,
                    {
                        method: "GET",
                        credentials: "include"
                    },
                    navigate
                );

                if (!response.ok && response.status !== 401) {
                    navigate("/");
                    return;
                }

                const data = await response.json();
                if (!isMounted) {
                    return;
                }

                setBoards(Array.isArray(data.message) ? data.message : []);
            } catch (error) {
                console.log("Error: ", error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadBoards();

        return () => {
            isMounted = false;
        };
    }, [navigate]);

    const openBoard = (board: Board) => {
        navigate(`/board/${board.id}`, { state: { boardName: board.title } });
    };

    const formatBoardDate = (value?: string | null) => {
        if (!value) {
            return null;
        }

        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) {
            return null;
        }

        return parsed.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    const createBoard = async () => {
        const trimmed = name.trim();
        if (!trimmed) {
            return;
        }

        try {
            const response = await fetchWithRefresh(
                `${import.meta.env.VITE_API_URL}/api/dashboard/board`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        Title: trimmed
                    }),
                    credentials: "include"
                },
                navigate
            );

            const data = await response.json();
            if (!response.ok) {
                throw Error("bad request");
            }

            setPopup(false);
            setName("");
            navigate(`/board/${data.id}`, { state: { boardName: data.title } });
        } catch (error) {
            console.log("Error: ", error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-200 text-slate-900">
            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                <header className="rounded-3xl bg-white/80 p-8 shadow-sm backdrop-blur">
                    <div className="flex flex-wrap items-center justify-between gap-6">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">
                                Dashboard
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold text-slate-800 sm:text-4xl">
                                My boards
                            </h1>
                            <p className="mt-3 max-w-xl text-base text-slate-500">
                                Keep track of your projects and jump back into work with a single
                                click.
                            </p>
                        </div>
                        <div className="shrink-0">
                            <UserButton />
                        </div>
                    </div>
                </header>

                <main className="mt-10">
                    {loading ? (
                        <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-3xl border border-slate-200 bg-white/70 p-12 text-center text-slate-500 shadow-inner">
                            <FiLoader className="animate-spin text-indigo-400" size={36} />
                            <span className="text-base font-medium">Loading your boards...</span>
                        </div>
                    ) : boards.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-300 bg-white/80 p-12 text-center shadow-sm">
                            <FiPlus className="text-indigo-400" size={40} />
                            <h2 className="text-2xl font-semibold text-slate-700">
                                Create your first board
                            </h2>
                            <p className="max-w-md text-sm text-slate-500">
                                Boards let you organize tasks by project or team. Create one to get
                                started.
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setPopup(true);
                                    setName("");
                                }}
                                className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-1"
                            >
                                <FiPlus />
                                <span>New board</span>
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {boards.map((board) => {
                                const formattedDate = formatBoardDate(board.date);
                                return (
                                    <button
                                        key={board.id}
                                        type="button"
                                        onClick={() => openBoard(board)}
                                        className="group flex h-44 w-full flex-col justify-between rounded-3xl border border-transparent bg-white/80 p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-1"
                                    >
                                        <div>
                                            <p className="line-clamp-1 text-lg font-semibold text-slate-800 group-hover:text-slate-900">
                                                {board.title}
                                            </p>
                                            {formattedDate && (
                                                <p className="mt-2 text-sm text-slate-500">
                                                    Updated {formattedDate}
                                                </p>
                                            )}
                                        </div>
                                        <span className="inline-flex items-center gap-2 text-sm font-medium text-indigo-500 transition group-hover:gap-3">
                                            Open board
                                            <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                                        </span>
                                    </button>
                                );
                            })}

                            <button
                                type="button"
                                onClick={() => {
                                    setPopup(true);
                                    setName("");
                                }}
                                className="flex h-44 w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-slate-300 bg-white/70 text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50/60 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-1"
                            >
                                <FiPlus size={28} />
                                <span className="text-sm font-semibold">Create new board</span>
                                <span className="text-xs text-slate-400">Quick start a fresh workspace</span>
                            </button>
                        </div>
                    )}
                </main>
            </div>

            {popup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
                    <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
                        <button
                            type="button"
                            onClick={() => setPopup(false)}
                            className="absolute right-4 top-4 text-slate-400 transition hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2"
                        >
                            <span className="sr-only">Close create board dialog</span>
                            <FiX size={20} />
                        </button>
                        <h3 className="text-2xl font-semibold text-slate-800">Create a new board</h3>
                        <p className="mt-2 text-sm text-slate-500">
                            Add a descriptive name to keep your workspace organized.
                        </p>
                        <div className="mt-6 space-y-2 text-left text-sm font-medium text-slate-600">
                            <label htmlFor="boardName">Board name</label>
                            <input
                                id="boardName"
                                type="text"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder="e.g. Product roadmap"
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 shadow-inner transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={createBoard}
                            disabled={!name.trim()}
                            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-1 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                        >
                            <FiPlus />
                            <span>Create board</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
