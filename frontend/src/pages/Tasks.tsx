import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import Navigation from "@/components/Navigation";
import TaskCard from "@/components/TaskCard";
import NewTaskModal from "@/components/modals/NewTaskModal";
import DeleteTaskModal from "@/components/modals/DeleteTaskModal";
import { tasksService, Task as ApiTask } from "@/services/tasks.service";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { handleApiError } from "@/lib/error-handler";

interface Task {
  id: number;
  title: string;
  description: string;
  assignee: string;
  assigneeId?: number;
  dueDate: string;
  status: "todo" | "in-progress" | "done";
  priority?: string;
  deleted?: boolean;
}

const Tasks = () => {
  const navigate = useNavigate();
  const { canEdit } = useAuth();
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const data = await tasksService.getAll();
      console.log('API returned tasks:', data);
      
      // Transform API data to component format
      const transformedTasks: Task[] = data.map((task: ApiTask) => {
        // Build assignee name: prefer single assignee, fallback to taskUsers (N:N)
        let assigneeName = "Não atribuído";
        if (task.assignee?.fullName) {
          assigneeName = task.assignee.fullName;
        } else if (task.taskUsers && task.taskUsers.length > 0) {
          assigneeName = task.taskUsers
            .map(tu => tu.user?.fullName)
            .filter(Boolean)
            .join(", ") || "Não atribuído";
        }

        return {
          id: task.id,
          title: task.title,
          description: task.description,
          assignee: assigneeName,
          assigneeId: task.assigneeId,
          dueDate: task.dueDate ? format(new Date(task.dueDate), "dd/MM/yyyy") : "",
          status: task.status,
          priority: task.priority,
          deleted: false,
        };
      });

      setTasks(transformedTasks);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const todoTasks = tasks.filter(task => task.status === 'todo' && !task.deleted);
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress' && !task.deleted);
  const doneTasks = tasks.filter(task => task.status === 'done' && !task.deleted);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const taskId = parseInt(draggableId);
    const newStatus = destination.droppableId as "todo" | "in-progress" | "done";

    // Update UI optimistically
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, status: newStatus }
          : task
      )
    );

    // Update on backend
    try {
      await tasksService.update(taskId, { status: newStatus });
      console.log(`Task ${taskId} status updated to ${newStatus}`);
    } catch (error: any) {
      console.error('Failed to update task status:', error);
      handleApiError(error, "Falha ao atualizar status da tarefa");
      // Revert on error
      loadTasks();
    }
  };

  const advanceTask = async (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    let newStatus: "todo" | "in-progress" | "done" = task.status;
    if (task.status === 'todo') {
      newStatus = 'in-progress';
    } else if (task.status === 'in-progress') {
      newStatus = 'done';
    }

    // Update UI optimistically
    setTasks(prevTasks => 
      prevTasks.map(t => 
        t.id === taskId ? { ...t, status: newStatus } : t
      )
    );

    // Update on backend
    try {
      await tasksService.update(taskId, { status: newStatus });
      console.log(`Task ${taskId} advanced to ${newStatus}`);
    } catch (error: any) {
      console.error('Failed to advance task:', error);
      handleApiError(error, "Falha ao avançar tarefa");
      // Revert on error
      loadTasks();
    }
  };

  const handleEditTask = (task: Task) => {
    console.log('handleEditTask called with:', task);
    console.log('AssigneeId from task:', task.assigneeId);
    setTaskToEdit(task);
    setIsNewTaskModalOpen(true);
  };

  const handleSoftDeleteTask = (task: Task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteTask = async () => {
    if (taskToDelete) {
      try {
        await tasksService.delete(taskToDelete.id);
        setTasks(prevTasks => 
          prevTasks.filter(task => task.id !== taskToDelete.id)
        );
        console.log(`Task ${taskToDelete.id} deleted`);
      } catch (error: any) {
        console.error('Failed to delete task:', error);
        handleApiError(error, "Falha ao excluir tarefa");
      } finally {
        setTaskToDelete(null);
        setIsDeleteModalOpen(false);
      }
    }
  };

  const handleEditComplete = () => {
    setIsNewTaskModalOpen(false);
    setTaskToEdit(null);
    // Small delay to ensure DB transaction completes
    setTimeout(() => {
      loadTasks(); // Reload tasks after create/edit
    }, 100);
  };

  const handleModalClose = (open: boolean) => {
    setIsNewTaskModalOpen(open);
    if (!open) {
      setTaskToEdit(null);
    }
  };

  const TaskColumn = ({ 
    title, 
    tasks, 
    droppableId 
  }: { 
    title: string; 
    tasks: Task[]; 
    droppableId: string;
  }) => (
    <Card className="flex-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          {title}
          <span className="text-sm font-normal text-muted-foreground">
            ({tasks.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Droppable droppableId={droppableId}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`space-y-4 min-h-[200px] p-2 rounded-lg transition-colors ${
                snapshot.isDraggingOver ? 'bg-muted/50' : ''
              }`}
            >
              {tasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  id={task.id}
                  index={index}
                  title={task.title}
                  description={task.description}
                  assignee={task.assignee}
                  assigneeId={task.assigneeId}
                  dueDate={task.dueDate}
                  status={task.status}
                  priority={task.priority}
                  onAdvance={() => advanceTask(task.id)}
                  onEdit={handleEditTask}
                  onSoftDelete={() => handleSoftDeleteTask(task)}
                  canEdit={canEdit()}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Carregando tarefas...
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="min-h-screen bg-muted/30">
        <Navigation />
        
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Controle de Tarefas</h1>
              <p className="text-muted-foreground text-sm sm:text-base">Status das tarefas. Arraste e solte para alterar o status.</p>
            </div>
            
            {canEdit() && (
              <Button 
                className="flex items-center gap-2"
                onClick={() => setIsNewTaskModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Nova Tarefa
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <TaskColumn 
              title="A Fazer" 
              tasks={todoTasks} 
              droppableId="todo"
            />
            <TaskColumn 
              title="Em Andamento" 
              tasks={inProgressTasks} 
              droppableId="in-progress"
            />
            <TaskColumn 
              title="Concluído" 
              tasks={doneTasks} 
              droppableId="done"
            />
          </div>

          <NewTaskModal 
            open={isNewTaskModalOpen}
            onOpenChange={handleModalClose}
            taskToEdit={taskToEdit}
            onEditComplete={handleEditComplete}
          />

          <DeleteTaskModal 
            open={isDeleteModalOpen}
            onOpenChange={setIsDeleteModalOpen}
            taskTitle={taskToDelete?.title || ""}
            onConfirm={confirmDeleteTask}
          />
        </div>
      </div>
    </DragDropContext>
  );
};

export default Tasks;