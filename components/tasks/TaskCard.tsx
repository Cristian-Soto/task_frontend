import React from 'react';
import { Task, STATUS_MAPPING } from '@/service/task';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: Task['status']) => void;
}

const priorityColors = {
  baja: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  media: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  alta: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
};

const statusColors = {
  pending: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  in_progress: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onStatusChange }) => {
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as Task['status'];
    console.log(`TaskCard: Cambiando estado de tarea ${task.id} de "${task.status}" a "${newStatus}"`);
    
    // Validar que el estado sea válido
    if (newStatus !== 'pending' && newStatus !== 'in_progress' && newStatus !== 'completed') {
      console.error(`Estado inválido: ${newStatus}`);
      return;
    }
    
    // Solo llamar a la función si el estado realmente cambió
    if (task.status !== newStatus) {
      console.log(`Actualizando estado de tarea ${task.id} de ${task.status} a ${newStatus}`);
      onStatusChange(task.id, newStatus);
    } else {
      console.log(`El estado de la tarea ${task.id} ya es ${newStatus}, no hay cambio`);
    }
  };
  // Asegurarnos de que la prioridad sea válida
  const priority = ['baja', 'media', 'alta'].includes(task.priority) ? task.priority : 'media';
  const status = ['pending', 'in_progress', 'completed'].includes(task.status) ? task.status : 'pending';
    // Debug para ver qué está recibiendo el componente
  console.log(`TaskCard - Datos recibidos:`, { 
    id: task.id, 
    title: task.title, 
    priority: task.priority,
    status: task.status
  });
  return (    <div className="bg-card-background dark:bg-gray-800 rounded-lg border border-border dark:border-gray-700 shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-foreground">{task.title}</h3>
        <div className="flex space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[priority]}`}>
            {priority === 'baja' ? 'Baja' : priority === 'media' ? 'Media' : 'Alta'}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
            {task.status_display || STATUS_MAPPING[status] || 'Pendiente'}
          </span>
        </div>
      </div><p className="text-muted-foreground mb-4 line-clamp-2">{task.description}</p>

      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-muted-foreground">
          Creada {formatDistanceToNow(new Date(task.created_at), { addSuffix: true, locale: es })}
        </div>
        {task.due_date && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Vence: {new Date(task.due_date).toLocaleDateString()}
          </div>
        )}
      </div>
        <div className="flex justify-between items-center">
        <select
          value={status}
          onChange={handleStatusChange}          className={`text-sm border rounded p-1 bg-background text-foreground
            ${status === 'in_progress' ? 'border-primary' : 
              status === 'completed' ? 'border-green-500' : 'border-input'}`}
        >
          <option value="pending">Pendiente</option>
          <option value="in_progress">En proceso</option>
          <option value="completed">Completada</option>
        </select>

        <div className="flex space-x-2">
          <button 
            onClick={() => onEdit(task)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Editar tarea"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button 
            onClick={() => onDelete(task.id)}
            className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
            aria-label="Eliminar tarea"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
