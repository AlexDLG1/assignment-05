const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();

const { prisma } = require("./lib/prisma");
const { swaggerSpec } = require("./docs/swagger");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
console.log(">>> SERVER.JS CORRECTO 053bd66 CARGADO");

app.get("/alex-check-053bd66", (req, res) => {
  res.json({
    ok: true,
    archivo: "server.js",
    commit: "053bd66"
  });
});
// Logger temporal
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.url}`);
  next();
});

// Swagger en /docs y también en /api-docs
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Ruta raíz
app.get("/", (req, res) => {
  res.json({
    ok: true,
    mensaje: "Backend UniTask activo"
  });
});

// Ping
const pingHandler = async (req, res) => {
  res.json({
    ok: true,
    mensaje: "pong"
  });
};

app.get("/ping", pingHandler);
app.get("/api/ping", pingHandler);

// Health check
const healthHandler = async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      ok: true,
      servicio: "backend",
      baseDeDatos: "conectada"
    });
  } catch (error) {
    console.error("Error en health check:", error);
    res.status(500).json({
      ok: false,
      error: "No se pudo conectar a la base de datos"
    });
  }
};

app.get("/health", healthHandler);
app.get("/api/health", healthHandler);

// Obtener todas las tareas
const getTasksHandler = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: {
        fechaEntrega: "asc"
      }
    });

    res.json(tasks);
  } catch (error) {
    console.error("Error al obtener tareas:", error);
    res.status(500).json({
      error: "No se pudieron obtener las tareas"
    });
  }
};

app.get("/tasks", getTasksHandler);
app.get("/api/tasks", getTasksHandler);

// Obtener una tarea por id
const getTaskByIdHandler = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        error: "El id debe ser numérico"
      });
    }

    const task = await prisma.task.findUnique({
      where: { id }
    });

    if (!task) {
      return res.status(404).json({
        error: "Tarea no encontrada"
      });
    }

    res.json(task);
  } catch (error) {
    console.error("Error al obtener la tarea:", error);
    res.status(500).json({
      error: "No se pudo obtener la tarea"
    });
  }
};

app.get("/tasks/:id", getTaskByIdHandler);
app.get("/api/tasks/:id", getTaskByIdHandler);

// Crear tarea
const createTaskHandler = async (req, res) => {
  try {
    console.log("BODY RECIBIDO:", req.body);

    const { curso, titulo, descripcion, fechaEntrega, completada } = req.body;

    if (!curso || !titulo || !fechaEntrega) {
      return res.status(400).json({
        error: "Los campos curso, titulo y fechaEntrega son obligatorios"
      });
    }

    const fecha = new Date(fechaEntrega);

    if (isNaN(fecha.getTime())) {
      return res.status(400).json({
        error: "La fechaEntrega no tiene un formato válido"
      });
    }

    const nuevaTask = await prisma.task.create({
      data: {
        curso,
        titulo,
        descripcion: descripcion || null,
        fechaEntrega: fecha,
        completada: completada ?? false
      }
    });

    res.status(201).json(nuevaTask);
  } catch (error) {
    console.error("Error al crear tarea:", error);
    res.status(500).json({
      error: "No se pudo crear la tarea",
      detalle: error.message
    });
  }
};

app.post("/tasks", createTaskHandler);
app.post("/api/tasks", createTaskHandler);

// Actualizar tarea
const updateTaskHandler = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        error: "El id debe ser numérico"
      });
    }

    const existente = await prisma.task.findUnique({
      where: { id }
    });

    if (!existente) {
      return res.status(404).json({
        error: "Tarea no encontrada"
      });
    }

    const { curso, titulo, descripcion, fechaEntrega, completada } = req.body;

    const data = {};

    if (curso !== undefined) data.curso = curso;
    if (titulo !== undefined) data.titulo = titulo;
    if (descripcion !== undefined) data.descripcion = descripcion;
    if (completada !== undefined) data.completada = completada;

    if (fechaEntrega !== undefined) {
      const fecha = new Date(fechaEntrega);

      if (isNaN(fecha.getTime())) {
        return res.status(400).json({
          error: "La fechaEntrega no tiene un formato válido"
        });
      }

      data.fechaEntrega = fecha;
    }

    const taskActualizada = await prisma.task.update({
      where: { id },
      data
    });

    res.json(taskActualizada);
  } catch (error) {
    console.error("Error al actualizar tarea:", error);
    res.status(500).json({
      error: "No se pudo actualizar la tarea"
    });
  }
};

app.patch("/tasks/:id", updateTaskHandler);
app.patch("/api/tasks/:id", updateTaskHandler);

// Eliminar tarea
const deleteTaskHandler = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        error: "El id debe ser numérico"
      });
    }

    const existente = await prisma.task.findUnique({
      where: { id }
    });

    if (!existente) {
      return res.status(404).json({
        error: "Tarea no encontrada"
      });
    }

    await prisma.task.delete({
      where: { id }
    });

    res.json({
      mensaje: "Tarea eliminada correctamente"
    });
  } catch (error) {
    console.error("Error al eliminar tarea:", error);
    res.status(500).json({
      error: "No se pudo eliminar la tarea"
    });
  }
};

app.delete("/tasks/:id", deleteTaskHandler);
app.delete("/api/tasks/:id", deleteTaskHandler);

// 404 controlado
app.use((req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    ruta: req.originalUrl
  });
});

async function startServer() {
  try {
    await prisma.$connect();

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error conectando Prisma al iniciar:", error);
    process.exit(1);
  }
}

startServer();