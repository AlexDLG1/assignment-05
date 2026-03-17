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

// Logger temporal para ver qué rutas están entrando
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.url}`);
  next();
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Ruta raíz
app.get("/", (req, res) => {
  res.json({
    ok: true,
    mensaje: "Backend UniTask activo"
  });
});

// Ruta de prueba simple
app.get("/api/ping", (req, res) => {
  res.json({
    ok: true,
    mensaje: "pong"
  });
});

// Health check
app.get("/api/health", async (req, res) => {
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
});

// Obtener todas las tareas
app.get("/api/tasks", async (req, res) => {
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
});

// Obtener una tarea por id
app.get("/api/tasks/:id", async (req, res) => {
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
});

// Crear tarea
app.post("/api/tasks", async (req, res) => {
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
});

// Actualizar tarea
app.patch("/api/tasks/:id", async (req, res) => {
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
});

// Eliminar tarea
app.delete("/api/tasks/:id", async (req, res) => {
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
});

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