import React, { useState } from 'react';
import { Task } from '@/service/task';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import toast from 'react-hot-toast';

// Definición de tipos personalizados para filtros
type TaskStatusFilter = Task['status'] | 'todas';
type TaskPriorityFilter = Task['priority'] | 'todas';

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
}) => {  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | undefined>(undefined);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  
  const [filter, setFilter] = useState<TaskStatusFilter>('todas');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriorityFilter>('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [totalPages, setTotalPages] = useState(1);

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
      console.log("TasksList: Procesando envío de formulario con datos:", taskData);
      
      if (currentTask) {
        console.log(`TasksList: Actualizando tarea existente ${currentTask.id}`);
        await onUpdateTask(currentTask.id, taskData);
        toast.success('Tarea actualizada correctamente');
      } else {
        console.log("TasksList: Creando nueva tarea");
        await onCreateTask(taskData);
        toast.success('Tarea creada correctamente');
      }
      handleCloseForm();
    } catch (error: any) {
      console.error("Error al procesar el formulario de tarea:", error);
      
      // Mostrar un mensaje de error más específico si está disponible
      const errorMessage = error.message || 'Error al guardar la tarea';
      toast.error(errorMessage);
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
  };  const handleStatusChange = async (id: number, status: Task['status']) => {
    try {
      // Encontrar la tarea que estamos actualizando
      const taskToUpdate = tasks.find(task => task.id === id);
      
      if (!taskToUpdate) {
        console.error(`No se encontró la tarea con ID ${id}`);
        toast.error('Error: No se encontró la tarea', { id: `status-${id}` });
        return;
      }
      
      console.log(`TasksList: Actualizando estado de tarea ${id} de ${taskToUpdate.status} a ${status}`);
      
      // Mostrar toast de carga
      toast.loading(`Cambiando estado a ${status === 'pending' ? 'Pendiente' : 
                                        status === 'in_progress' ? 'En proceso' : 
                                        'Completada'}...`, 
                   { id: `status-${id}` });
        try {
        // Llamar a la función de actualización
        await onUpdateTask(id, { status });
        
        console.log(`TasksList: Estado actualizado correctamente para tarea ${id} a ${status}`);
        
        // Mostrar confirmación
        toast.success(`Estado cambiado a ${status === 'pending' ? 'Pendiente' : 
                                        status === 'in_progress' ? 'En proceso' : 
                                        'Completada'}`, 
                    { id: `status-${id}` });
      } catch (error) {
        console.error(`Error al actualizar el estado de la tarea ${id}:`, error);
        toast.error('Error al actualizar el estado', { id: `status-${id}` });
      }
    } catch (error) {
      toast.error('Error al actualizar el estado', { id: `status-${id}` });
      console.error('Error en handleStatusChange:', error);
    }
  };  // Mapeo entre valores de filtro en español y valores de la API
  const filterToApiStatusMap: Record<string, string> = {
    'pendiente': 'pending',
    'en_progreso': 'in_progress',
    'completada': 'completed'
  };
    // Mapeo entre valores de prioridad en español y valores de la API
  const priorityMap: Record<string, string> = {
    'baja': 'baja',
    'media': 'media',
    'alta': 'alta'
  };
  
  // Función para obtener el texto descriptivo del estado
  const getStatusDisplay = (status: TaskStatusFilter): string => {
    if (status === 'todas') return '';
    else if (status === 'pending') return 'pendientes';
    else if (status === 'in_progress') return 'en proceso';
    else if (status === 'completed') return 'completadas';
    return '';
  };
    // Filtrar por estado, prioridad y por término de búsqueda
  const filteredTasks = tasks
    .filter(task => filter === 'todas' || task.status === filterToApiStatusMap[filter] || task.status === filter)
    .filter(task => priorityFilter === 'todas' || task.priority === priorityFilter)
    .filter(task => 
      searchTerm === '' || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
  // Calcular páginas para la paginación
  const totalItems = filteredTasks.length;
  const totalPagesCount = Math.ceil(totalItems / itemsPerPage) || 1;
  
  // Asegurarnos de que la página current es válida
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPagesCount));
  
  // Obtener tareas para la página actual
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedTasks = filteredTasks.slice(startIndex, endIndex);
  
  // Manejar el cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Desplazar hacia arriba para mostrar la nueva página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">      <div className="flex flex-col space-y-6 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-0">Mis Tareas</h2>
          
          <button
            onClick={() => handleOpenForm()}
            className="flex items-center justify-center gap-2 px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Nueva Tarea
          </button>
        </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Filtros</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 text-gray-400 dark:text-gray-500" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                  />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por título..."
                className="px-4 py-2 pl-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm text-gray-600 dark:text-gray-200 w-full"
              />
            </div>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as TaskStatusFilter)}
              className={`px-4 py-2 bg-white dark:bg-gray-700 border ${filter !== 'todas' ? 'border-indigo-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm text-sm ${filter !== 'todas' ? 'text-indigo-700 dark:text-indigo-300 font-medium' : 'text-gray-600 dark:text-gray-300'}`}
            >
              <option value="todas">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="in_progress">En Proceso</option>
              <option value="completed">Completadas</option>
            </select>
            
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as TaskPriorityFilter)}
              className={`px-4 py-2 bg-white dark:bg-gray-700 border ${priorityFilter !== 'todas' ? 'border-indigo-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm text-sm ${priorityFilter !== 'todas' ? 'text-indigo-700 dark:text-indigo-300 font-medium' : 'text-gray-600 dark:text-gray-300'}`}
            >
              <option value="todas">Todas las prioridades</option>
              <option value="baja">Prioridad Baja</option>
              <option value="media">Prioridad Media</option>
              <option value="alta">Prioridad Alta</option>
            </select>
          </div>
          
          {/* Indicadores de filtros activos */}
          {(filter !== 'todas' || priorityFilter !== 'todas' || searchTerm) && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Filtros activos:</span>
              
              {filter !== 'todas' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                  Estado: {getStatusDisplay(filter)}
                  <button 
                    onClick={() => setFilter('todas')} 
                    className="ml-1 text-indigo-500 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-100 focus:outline-none"
                    aria-label="Eliminar filtro de estado"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              )}
              
              {priorityFilter !== 'todas' && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  priorityFilter === 'baja' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 
                  priorityFilter === 'media' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  Prioridad: {priorityFilter}
                  <button 
                    onClick={() => setPriorityFilter('todas')} 
                    className={`ml-1 ${
                      priorityFilter === 'baja' ? 'text-blue-500 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100' : 
                      priorityFilter === 'media' ? 'text-yellow-500 hover:text-yellow-800 dark:text-yellow-300 dark:hover:text-yellow-100' : 
                      'text-red-500 hover:text-red-800 dark:text-red-300 dark:hover:text-red-100'
                    } focus:outline-none`}
                    aria-label="Eliminar filtro de prioridad"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              )}
              
              {searchTerm && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                  Búsqueda: {searchTerm}
                  <button 
                    onClick={() => setSearchTerm('')} 
                    className="ml-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                    aria-label="Eliminar término de búsqueda"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              )}
              
              {(filter !== 'todas' || priorityFilter !== 'todas' || searchTerm) && (
                <button 
                  onClick={() => {
                    setFilter('todas');
                    setPriorityFilter('todas');
                    setSearchTerm('');
                  }} 
                  className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none ml-auto font-medium"
                >
                  Limpiar todos
                </button>
              )}
            </div>
          )}
        </div>      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="flex justify-between">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>      ) : filteredTasks.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleOpenForm}
                onDelete={handleDeleteClick}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
          
          {/* Paginación */}
          {totalPagesCount > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center space-x-2" aria-label="Paginación">
                {/* Botón Anterior */}
                <button
                  onClick={() => handlePageChange(validCurrentPage - 1)}
                  disabled={validCurrentPage === 1}
                  className={`px-3 py-2 rounded-md ${
                    validCurrentPage === 1
                      ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  aria-label="Ir a la página anterior"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Números de Página */}
                {Array.from({ length: totalPagesCount }, (_, i) => i + 1)
                  .filter(page => 
                    page === 1 || 
                    page === totalPagesCount || 
                    (page >= validCurrentPage - 1 && page <= validCurrentPage + 1)
                  )
                  .map((page, index, array) => {
                    // Mostrar puntos suspensivos si hay saltos en la secuencia
                    const showEllipsis = index > 0 && page - array[index - 1] > 1;
                    
                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && (
                          <span className="px-3 py-2 text-gray-500 dark:text-gray-400">...</span>
                        )}
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 rounded-md ${
                            page === validCurrentPage
                              ? 'bg-indigo-600 text-white'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                          aria-current={page === validCurrentPage ? 'page' : undefined}
                          aria-label={`Ir a la página ${page}`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}
                
                {/* Botón Siguiente */}
                <button
                  onClick={() => handlePageChange(validCurrentPage + 1)}
                  disabled={validCurrentPage === totalPagesCount}
                  className={`px-3 py-2 rounded-md ${
                    validCurrentPage === totalPagesCount
                      ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  aria-label="Ir a la página siguiente"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          )}
          
          {/* Selector de elementos por página */}
          {totalItems > 6 && (
            <div className="flex justify-center items-center mt-2 text-sm text-gray-600 dark:text-gray-300">
              <span>Mostrar</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1); // Resetear a la primera página
                }}
                className="mx-2 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                aria-label="Elementos por página"
              >
                <option value="6">6</option>
                <option value="12">12</option>
                <option value="24">24</option>
              </select>
              <span>elementos por página</span>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>          <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
            {searchTerm 
              ? `No se encontraron tareas para "${searchTerm}"` 
              : priorityFilter !== 'todas' && filter !== 'todas'
                ? `No hay tareas ${getStatusDisplay(filter)} con prioridad ${priorityFilter}`
                : priorityFilter !== 'todas'
                  ? `No hay tareas con prioridad ${priorityFilter}`
                  : filter !== 'todas' 
                    ? `No hay tareas ${getStatusDisplay(filter)}`
                    : 'No hay tareas'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchTerm 
              ? "Intenta con otra búsqueda o cambia los filtros aplicados." 
              : filter === 'todas' && priorityFilter === 'todas'
                ? 'Comienza creando una nueva tarea para organizar tu trabajo.' 
                : `Prueba cambiando los filtros o crea una nueva tarea.`}
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
      )}      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto backdrop-blur-sm bg-black/30 flex items-center justify-center px-4" onClick={handleCloseForm}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <TaskForm
              task={currentTask}
              onSubmit={handleSubmitForm}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto backdrop-blur-sm bg-black/30" onClick={() => setIsDeleteDialogOpen(false)}>
          <div className="min-h-screen px-4 flex items-center justify-center">
            <div className="fixed inset-0" onClick={() => setIsDeleteDialogOpen(false)}></div>

            <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md z-20 relative">
              <h2 className="text-xl font-bold mb-4 text-gray-700 dark:text-gray-200">Confirmar eliminación</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                ¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none"
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
        </div>
      )}
    </div>
  );
};

export default TasksList;
