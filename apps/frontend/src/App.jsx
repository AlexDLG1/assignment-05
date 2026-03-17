import { useEffect, useState } from "react";
import "./App.css";
import { getTasks, createTask, updateTask, deleteTask } from "./services/tasks";

function App() {
  const [tasks, setTasks] = useState([]);
  const [curso, setCurso] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTasks() {
    try {
      setLoading(true);
      setError("");
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError("");

      await createTask({
        curso,
        titulo,
        descripcion,
        fechaEntrega: new Date(fechaEntrega).toISOString()
      });

      setCurso("");
      setTitulo("");
      setDescripcion("");
      setFechaEntrega("");

      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggleComplete(task) {
    try {
      setError("");

      await updateTask(task.id, {
        completada: !task.completada
      });

      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      setError("");
      await deleteTask(id);
      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container">
      <h1>UniTask</h1>
      <p className="subtitle">Gestión de tareas académicas</p>

      <form className="task-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Curso"
          value={curso}
          onChange={(e) => setCurso(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
        />

        <textarea
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />

        <input
          type="datetime-local"
          value={fechaEntrega}
          onChange={(e) => setFechaEntrega(e.target.value)}
          required
        />

        <button type="submit">Agregar tarea</button>
      </form>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Cargando tareas...</p>
      ) : tasks.length === 0 ? (
        <p>No hay tareas registradas.</p>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <div key={task.id} className={`task-card ${task.completada ? "done" : ""}`}>
              <h3>{task.titulo}</h3>
              <p><strong>Curso:</strong> {task.curso}</p>
              <p><strong>Descripción:</strong> {task.descripcion || "Sin descripción"}</p>
              <p>
                <strong>Entrega:</strong>{" "}
                {new Date(task.fechaEntrega).toLocaleString()}
              </p>
              <p>
                <strong>Estado:</strong> {task.completada ? "Completada" : "Pendiente"}
              </p>

              <div className="actions">
                <button onClick={() => handleToggleComplete(task)}>
                  {task.completada ? "Marcar pendiente" : "Marcar completada"}
                </button>

                <button className="delete-btn" onClick={() => handleDelete(task.id)}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;