"use client";

/**
 * @file TaskForm.tsx
 * @description Formulario para crear y editar tareas con validación de campos
 * y soporte para diferentes estados y prioridades.
 * @author Tu Equipo de Desarrollo
 * @version 1.1.0
 * @lastModified 2025-05-21
 */

import { useState, useEffect } from "react";
import { Task } from "@/service/task";
import toast from "react-hot-toast";

/**
 * Propiedades para el componente TaskForm
 * @interface TaskFormProps
 * @property {Task} [task] - Tarea existente para editar (opcional)
 * @property {Function} onSubmit - Función de callback para enviar el formulario
 * @property {Function} onCancel - Función para cancelar y cerrar el formulario
 */

interface TaskFormProps {
  task?: Task;
  onSubmit: (taskData: Omit<Task, "id" | "created_at" | "user">) => void;
  onCancel: () => void;
}

const initialFormState = {
  title: "",
  description: "",
  status: "pending" as Task["status"],
  priority: "media" as Task["priority"],
  due_date: ""
};

const TaskForm: React.FC<TaskFormProps> = ({ task, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(initialFormState);
  const isEditing = !!task;
  
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status as Task["status"],
        priority: task.priority as Task["priority"],
        due_date: task.due_date ? new Date(task.due_date).toISOString().split("T")[0] : ""
      });
    }
  }, [task]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("El título de la tarea es obligatorio");
      return;
    }
    
    // Validar que el estado y la prioridad sean correctos
    if (!['pending', 'in_progress', 'completed'].includes(formData.status)) {
      console.error(`Estado inválido en el formulario: ${formData.status}`);
      toast.error("Estado de tarea no válido");
      return;
    }

    if (!['baja', 'media', 'alta'].includes(formData.priority)) {
      console.error(`Prioridad inválida en el formulario: ${formData.priority}`);
      toast.error("Prioridad de tarea no válida");
      return;
    }
    
    console.log("TaskForm: Enviando datos de la tarea:", {
      ...formData,
      due_date: formData.due_date || null
    });

    onSubmit({
      ...formData,
      due_date: formData.due_date || null
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        {isEditing ? "Editar Tarea" : "Nueva Tarea"}
      </h2>

      <div className="mb-4">
        <label
          htmlFor="title"
          className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2"
        >
          Título <span className="text-red-500 dark:text-red-400">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700"
          placeholder="Título de la tarea"
          required
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="description"
          className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2"
        >
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 min-h-[100px]"
          placeholder="Descripción detallada de la tarea"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label
            htmlFor="status"
            className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2"
          >
            Estado
          </label>          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700"
          >
            <option value="pending">Pendiente</option>
            <option value="in_progress">En proceso</option>
            <option value="completed">Completada</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="priority"
            className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2"
          >
            Prioridad
          </label>          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700"
          >
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="due_date"
            className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2"
          >
            Fecha límite
          </label>
          <input
            type="date"
            id="due_date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {isEditing ? "Actualizar" : "Crear"}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
