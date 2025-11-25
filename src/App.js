import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { FaPencilAlt} from "react-icons/fa";
import "./App.css";
import { FaDeleteLeft } from "react-icons/fa6";

function App() {
  const [tasks, setTasks] = useState({
    todo: [],
    inProgress: [],
    completed: [],
  });

  const [allTasks, setAllTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  const handleAdd = () => {
    if (newTask.trim() === "") return;
    const id = Date.now().toString();
    const task = { id, text: newTask, status: "todo" }; 
    setTasks((prev) => ({
      ...prev,
      todo: [...prev.todo, task],
    }));
    setAllTasks((prev) => [...prev, task]); 
    setNewTask("");
  };

  const handleDelete = (column, id) => {
    setTasks((prev) => ({
      ...prev,
      [column]: prev[column].filter((task) => task.id !== id),
    }));
  };

  const handleEdit = (column, id) => {
    const newText = prompt("Edit your task:");
    if (newText && newText.trim() !== "") {
      setTasks((prev) => ({
        ...prev,
        [column]: prev[column].map((task) =>
          task.id === id ? { ...task, text: newText } : task
        ),
      }));
      setAllTasks((prev) =>
        prev.map((task) => (task.id === id ? { ...task, text: newText } : task))
      );
    }
  };

  const toggleActive = (column, id) => {
    setTasks((prev) => {
      const taskToToggle = prev[column].find((t) => t.id === id);
      if (!taskToToggle) return prev;

      let newState = { ...prev };
      newState[column] = newState[column].filter((t) => t.id !== id);

      if (column === "todo") {
        const moved = { ...taskToToggle, status: "inProgress" };
        newState.inProgress = [...newState.inProgress, moved];
      } else if (column === "inProgress") {
        const moved = { ...taskToToggle, status: "todo" };
        newState.todo = [...newState.todo, moved];
      }
      return newState;
    });

    setAllTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status:
                t.status === "todo"
                  ? "inProgress"
                  : t.status === "inProgress"
                  ? "todo"
                  : t.status,
            }
          : t
      )
    );
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const startColumn = source.droppableId;
    const endColumn = destination.droppableId;
    const startTasks = Array.from(tasks[startColumn]);
    const [movedTask] = startTasks.splice(source.index, 1);

    const endTasks = Array.from(tasks[endColumn]);
    endTasks.splice(destination.index, 0, { ...movedTask, status: endColumn });

    setTasks((prev) => ({
      ...prev,
      [startColumn]: startTasks,
      [endColumn]: endTasks,
    }));

    setAllTasks((prev) =>
      prev.map((t) => (t.id === movedTask.id ? { ...t, status: endColumn } : t))
    );
  };

  const getStatusDetails = (status) => {
    switch (status) {
      case "todo":
        return { color: "red", label: "To Do" };
      case "inProgress":
        return { color: "green", label: "In Progress" };
      case "completed":
        return { color: "yellow", label: "Completed" };
      default:
        return { color: "gray", label: "" };
    }
  };

  return (
    <div className="whole_body">
      <div className="app">
        <h1 className="titel_board">SCHEDULE BOARD</h1>

        <div className="input-section">
          <input
            className="new_task"
            type="text"
            value={newTask}
            placeholder="Enter new task..."
            onChange={(e) => setNewTask(e.target.value)}
          />
          <button className="task_butt" onClick={handleAdd}>
            Add Task
          </button>
        </div>

        <div className="all-tasks">
          <h2>ALL TASKS</h2>
          {allTasks.length === 0 ? (
            <p>No tasks added yet.</p>
          ) : (
            <ul>
              {allTasks.map((task) => {
                const { color, label } = getStatusDetails(task.status);
                return (
                  <li key={task.id}>
                    <span
                      className="status_dot"
                      style={{ backgroundColor: color }}
                    ></span>
                    {task.text} — <em>{label}</em>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="board">
            {Object.entries(tasks).map(([columnId, columnTasks]) => (
              <Droppable key={columnId} droppableId={columnId}>
                {(provided) => (
                  <div
                    className="column"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    <h2 className="col_id">
                      {columnId === "todo"
                        ? "TO DO"
                        : columnId === "inProgress"
                        ? "IN PROGRESS"
                        : "COMPLETED"}
                    </h2>

                    {columnTasks.map((task, index) => {
                      const { color } = getStatusDetails(task.status);
                      return (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              className="task"
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <div className="task-info">
                                <span
                                  className="status_dot"
                                  style={{ backgroundColor: color }}></span>
                                <span className="task-text">
                                  {task.text}{" "}
                                  {task.status === "completed" && (
                                    <em className="completed-text">
                                      (Completed)
                                    </em>
                                  )}
                                </span>
                              </div>

                              <div className="buttons">
                                {columnId !== "completed" && (
                                  <button
                                    className="toggle"
                                    onClick={() =>
                                      toggleActive(columnId, task.id)
                                    }
                                    style={{
                                      color:
                                        columnId === "todo" ? "green" : "red",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {columnId === "todo"
                                      ? "Activate"
                                      : "Deactivate"}
                                  </button>
                                )}
                                <button
                                  className="edit"
                                  onClick={() => handleEdit(columnId, task.id)}
                                >
                                   <FaPencilAlt/>
                                </button>
                                <button
                                  className="delete"
                                  onClick={() =>
                                    handleDelete(columnId, task.id)
                                  }
                                >
                                  <FaDeleteLeft/>
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}

export default App;
