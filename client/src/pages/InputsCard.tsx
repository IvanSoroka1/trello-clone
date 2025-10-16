import { Clipboard } from "lucide-react";
export default function InputsCard({ children}: { children: React.ReactNode}) {
    return (
        <div className="flex flex-col justify-center min-h-screen items-center bg-hero text-center">
            <div className = "shadow-lg flex flex-col justify-center items-center p-12 rounded-lg bg-white w-1/4">
                {children}
            </div>
        </div>
    )
}

export function AppName(){
    return (
        <div>
            <Clipboard className="w-1/3 h-1/3 text-blue-500 mx-auto mb-4" />
            <div className="text-4xl text-center font-semibold">
                Task Managing App
            </div>
            <div className="text-1xl text-gray-500 text-center py-2">
                Stay organized and on top of tasks
            </div>
        </div>
    );
}