const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'UniTask API',
    version: '1.0.0',
    description: 'API para gestionar tareas académicas del proyecto assignment-05'
  },
  servers: [
    {
      url: process.env.PUBLIC_API_URL || 'http://localhost:3000',
      description: 'Servidor actual'
    }
  ],
  tags: [
    {
      name: 'Health',
      description: 'Verificación del estado del backend'
    },
    {
      name: 'Tasks',
      description: 'Operaciones CRUD de tareas'
    }
  ],
  components: {
    schemas: {
      Task: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          curso: { type: 'string', example: 'Arquitectura de Sistemas 2' },
          titulo: { type: 'string', example: 'Entregar assignment-05' },
          descripcion: { type: 'string', example: 'Monorepo con frontend, backend y base de datos' },
          fechaEntrega: { type: 'string', format: 'date-time', example: '2026-03-20T23:59:00.000Z' },
          completada: { type: 'boolean', example: false },
          createdAt: { type: 'string', format: 'date-time', example: '2026-03-17T02:17:44.255Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2026-03-17T02:17:44.255Z' }
        }
      },
      TaskInput: {
        type: 'object',
        required: ['curso', 'titulo', 'fechaEntrega'],
        properties: {
          curso: { type: 'string', example: 'Bases de Datos 2' },
          titulo: { type: 'string', example: 'Hacer modelo relacional' },
          descripcion: { type: 'string', example: 'Terminar tablas y relaciones' },
          fechaEntrega: { type: 'string', format: 'date-time', example: '2026-03-25T23:59:00.000Z' }
        }
      },
      TaskUpdate: {
        type: 'object',
        properties: {
          curso: { type: 'string', example: 'Arquitectura de Sistemas 2' },
          titulo: { type: 'string', example: 'Entregar assignment-05 final' },
          descripcion: { type: 'string', example: 'Swagger, frontend y despliegue' },
          fechaEntrega: { type: 'string', format: 'date-time', example: '2026-03-30T23:59:00.000Z' },
          completada: { type: 'boolean', example: true }
        }
      }
    }
  },
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Verificar estado del backend',
        responses: {
          200: {
            description: 'Backend activo'
          }
        }
      }
    },
    '/api/tasks': {
      get: {
        tags: ['Tasks'],
        summary: 'Listar todas las tareas',
        responses: {
          200: {
            description: 'Lista de tareas'
          }
        }
      },
      post: {
        tags: ['Tasks'],
        summary: 'Crear una nueva tarea',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/TaskInput'
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Tarea creada correctamente'
          },
          400: {
            description: 'Datos inválidos'
          }
        }
      }
    },
    '/api/tasks/{id}': {
      get: {
        tags: ['Tasks'],
        summary: 'Obtener una tarea por ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'integer'
            }
          }
        ],
        responses: {
          200: {
            description: 'Tarea encontrada'
          },
          404: {
            description: 'Tarea no encontrada'
          }
        }
      },
      patch: {
        tags: ['Tasks'],
        summary: 'Actualizar una tarea por ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'integer'
            }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/TaskUpdate'
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Tarea actualizada'
          },
          404: {
            description: 'Tarea no encontrada'
          }
        }
      },
      delete: {
        tags: ['Tasks'],
        summary: 'Eliminar una tarea por ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'integer'
            }
          }
        ],
        responses: {
          200: {
            description: 'Tarea eliminada'
          },
          404: {
            description: 'Tarea no encontrada'
          }
        }
      }
    }
  }
};

module.exports = { swaggerSpec };