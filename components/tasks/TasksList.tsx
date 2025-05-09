import React, { useState } from 'react';
import { Task } from '@/service/task';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import { Dialog } from '@headlessui/react';
import toast from 'react-hot-toast';

interface TasksListProps {
  tasks: Task[];
  isLoading: boolean;
  onCreateTask: (taskData: Omit<Task, 'id' | 'created_at' | 'user'>) => Promise<void>;
  onUpdateTask: (id: number, taskData: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: number) => Promise<void>;
}

const TasksList: React.FC<TasksListProps> = ({ 
  tasks, 
  isLoading, 
  onCreateTask,
  onUpdateTask,
  onDeleteTask 
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | undefined>(undefined);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [filter, setFilter] = useState<Task['status'] | 'todas'>('todas');

  const handleOpenForm = (task?: Task) => {
    setCurrentTask(task);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setCurrentTask(undefined);
    setIsFormOpen(false);
  };

  const handleSubmitForm = async (taskData: Omit<Task, 'id' | 'created_at' | 'user'>) => {
    try {
      if (currentTask) {
        await onUpdateTask(currentTask.id, taskData);
        toast.success('Tarea actualizada correctamente');
      } else {
        await onCreateTask(taskData);
        toast.success('Tarea creada correctamente');
      }
      handleCloseForm();
    } catch (error) {
      toast.error('Error al guardar la tarea');
      console.error(error);
    }
  };

  const handleDeleteClick = (id: number) => {
    setTaskToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (taskToDelete !== null) {
      try {
        await onDeleteTask(taskToDelete);
        toast.success('Tarea eliminada correctamente');
        setIsDeleteDialogOpen(false);
        setTaskToDelete(null);
      } catch (error) {
        toast.error('Error al eliminar la tarea');
        console.error(error);
      }
    }
  };

  const handleStatusChange = async (id: number, status: Task['status']) => {
    try {
      await onUpdateTask(id, { status });
      toast.success('Estado actualizado correctamente');
    } catch (error) {
      toast.error('Error al actualizar el estado');
      console.error(error);
    }
  };

  const filteredTasks = filter === 'todas' 
    ? tasks 
    : tasks.filter(task => task.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Mis Tareas</h2>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm"
          >
            <option value="todas">Todas</option>
            <option value="pendiente">Pendientes</option>
            <option value="en_progreso">En Progreso</option>
            <option value="completada">Completadas</option>
          </select>
          
          <button
            onClick={() => handleOpenForm()}
            className="flex items-center justify-center gap-2 px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Nueva Tarea
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="flex justify-between">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleOpenForm}
              onDelete={handleDeleteClick}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No hay tareas {filter !== 'todas' ? `${filter}s` : ''}</h3>
          <p className="text-gray-500 mb-6">
            {filter === 'todas' 
              ? 'Comienza creando una nueva tarea para organizar tu trabajo.' 
              : `No tienes tareas marcadas como ${filter}s.`}
          </p>
          <button
            onClick={() => handleOpenForm()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Crear tarea
          </button>
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <TaskForm
              task={currentTask}
              onSubmit={handleSubmitForm}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="min-h-screen px-4 flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-30"></div>

          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md z-20">
            <Dialog.Title className="text-xl font-bold mb-4">Confirmar eliminación</Dialog.Title>
            <Dialog.Description className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.
            </Dialog.Description>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteDialogOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default TasksList;
