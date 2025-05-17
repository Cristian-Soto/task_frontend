// Función mejorada para actualizar el estado de una tarea
import api from '@/service/index';
import { Task, STATUS_MAPPING } from '@/service/task';

export const updateTaskStatusImproved = async (id: number, status: Task['status']): Promise<Task> => {
    console.log(`updateTaskStatusImproved: Actualizando tarea ${id} a estado ${status}`);

    try {
        // 1. Primero obtenemos la tarea completa para asegurarnos de tener todos los datos
        const taskResponse = await api.get(`/api/tasks/${id}/`);
        const originalTask = taskResponse.data;
        
        console.log(`Task original:`, originalTask);
        
        // 2. Preservamos la prioridad original
        const originalPriority = originalTask.priority || 'media';
        
        // 3. Hacemos la actualización incluyendo explícitamente la prioridad original
        const updateResponse = await api.patch(`/api/tasks/${id}/`, { 
            status,
            priority: originalPriority // Incluimos la prioridad original
        });
        
        const updatedTask = updateResponse.data;
        
        // 4. Nos aseguramos de que la respuesta sea válida
        if (!updatedTask || !updatedTask.id) {
            throw new Error('Respuesta inválida del servidor');
        }
        
        // 5. Validamos y normalizamos la respuesta
        const validatedTask: Task = {
            ...updatedTask,
            status: ['pending', 'in_progress', 'completed'].includes(updatedTask.status) 
                ? updatedTask.status 
                : status,
            priority: ['baja', 'media', 'alta'].includes(updatedTask.priority)
                ? updatedTask.priority
                : originalPriority, // Asegurarnos de mantener la prioridad original
            status_display: STATUS_MAPPING[status as keyof typeof STATUS_MAPPING]
        };
        
        console.log(`Tarea actualizada con éxito:`, validatedTask);
        return validatedTask;
    } catch (error) {
        console.error(`Error al actualizar el estado de la tarea:`, error);
        throw error;
    }
};
