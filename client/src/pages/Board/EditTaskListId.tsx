import { useState } from "react";

function TaskListName(taskList: TaskList, editTaskListId: number, setEditTaskListId: , setTaskLists: ) {
    const [taskName, setTaskName] = useState('');

    const editTaskListName = async () => {
        try {

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/edittasklist`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    TaskListName: taskName,
                    ListId: editTaskListId,
                    BoardId: id
                }),
                credentials: "include"
            });
            const data = await response.json();
            if (!response.ok)
                throw (data.message);
            else {
                setTaskLists(prev => {

                    const newTaskLists = prev.map((element) => {
                        if (element.id === taskList.id)
                            element.name = e.target.value;
                        return element;
                    })
                });
                setEditTaskListId(null);
                setTaskName('');
            }

        } catch (e) {
            console.log(e);
        }
    }
    editTaskListId !== taskList.id ? (
        <div onClick={() => { setEditTaskListId(taskList.id); setTaskName(taskList.name) }} className="font-semibold p-1">
            {taskList.name}
        </div>)
        : (
            <input value={taskName}
                onChange={e => setTaskName(e.target.value)}
                // onChange={e => setTaskLists(prev => {

                //     const newTaskLists = prev.map((element) => {
                //         if (element.id === taskList.id)
                //             element.name = e.target.value;
                //         return element;
                //     });

                //     return newTaskLists;
                // })}
                className="rounded p-1 bg-white font-semibold"
                onKeyDown={(e) => e.key === "Enter" && editTaskListName()}
                onBlur={() => setEditTaskListId(null)}>

            </input>

        )
}
