import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Calendar, MapPin, Clock, Users, Trash2, UserPlus, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import EventTaskModal from "@/components/modals/EventTaskModal";
import DeleteTaskModal from "@/components/modals/DeleteTaskModal";
import { eventsService, Event as ApiEvent } from "@/services/events.service";
import { tasksService, Task } from "@/services/tasks.service";
import { usersService, User } from "@/services/users.service";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { handleApiError } from "@/lib/error-handler";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const priorityColors: Record<string, string> = {
  baixa: "bg-blue-100 text-blue-800 border-blue-200",
  média: "bg-yellow-100 text-yellow-800 border-yellow-200",
  alta: "bg-orange-100 text-orange-800 border-orange-200",
  urgente: "bg-red-100 text-red-800 border-red-200",
};

const statusLabels: Record<string, string> = {
  todo: "A Fazer",
  "in-progress": "Em Andamento",
  done: "Concluído",
};

const statusColors: Record<string, string> = {
  todo: "bg-gray-100 text-gray-800",
  "in-progress": "bg-blue-100 text-blue-800",
  done: "bg-green-100 text-green-800",
};

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canEdit } = useAuth();

  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<{ id: number; title: string } | null>(null);
  const [assigningTaskId, setAssigningTaskId] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      const [eventData, tasksData, usersData] = await Promise.all([
        eventsService.getOne(+id!),
        tasksService.getByEvent(+id!),
        usersService.getAll(),
      ]);
      setEvent(eventData);
      setTasks(tasksData);
      setUsers(usersData.filter(u => u.status === 'active'));
    } catch (error) {
      console.error("Failed to load event data:", error);
      handleApiError(error, "Erro ao carregar dados do evento");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignUser = async (taskId: number, userId: string) => {
    try {
      await tasksService.assignUser(taskId, parseInt(userId));
      toast({
        title: "Voluntário alocado!",
        description: "O voluntário foi alocado na tarefa com sucesso.",
      });
      setAssigningTaskId(null);
      loadData();
    } catch (error: any) {
      handleApiError(error, "Erro ao alocar voluntário");
    }
  };

  const handleUnassignUser = async (taskId: number, userId: number) => {
    try {
      await tasksService.unassignUser(taskId, userId);
      toast({
        title: "Voluntário removido",
        description: "O voluntário foi removido da tarefa.",
      });
      loadData();
    } catch (error: any) {
      handleApiError(error, "Erro ao remover voluntário");
    }
  };

  const handleDeleteTask = async () => {
    if (taskToDelete) {
      try {
        await tasksService.delete(taskToDelete.id);
        toast({ title: "Tarefa excluída", description: `"${taskToDelete.title}" foi excluída.` });
        setTaskToDelete(null);
        loadData();
      } catch (error: any) {
        handleApiError(error, "Erro ao excluir tarefa");
      }
    }
  };

  const handleEditTask = (task: Task) => {
    const assigneeIds = task.taskUsers?.map(tu => tu.userId) || [];
    setTaskToEdit({
      id: task.id,
      title: task.title,
      description: task.description,
      dueDate: format(new Date(task.dueDate), "dd/MM/yyyy"),
      priority: task.priority,
      status: task.status,
      assigneeIds,
    });
    setIsTaskModalOpen(true);
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await tasksService.update(taskId, { status: newStatus as any });
      toast({ title: "Status atualizado" });
      loadData();
    } catch (error: any) {
      handleApiError(error, "Erro ao atualizar status");
    }
  };

  const getAvailableUsersForTask = (task: Task) => {
    const assignedIds = task.taskUsers?.map(tu => tu.userId) || [];
    return users.filter(u => !assignedIds.includes(u.id));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Carregando evento...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">Evento não encontrado</p>
          <Button onClick={() => navigate("/events")}>Voltar para Eventos</Button>
        </div>
      </div>
    );
  }

  const todoTasks = tasks.filter(t => t.status === "todo");
  const inProgressTasks = tasks.filter(t => t.status === "in-progress");
  const doneTasks = tasks.filter(t => t.status === "done");

  const totalTasks = tasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((doneTasks.length / totalTasks) * 100) : 0;
  const todoPercent = totalTasks > 0 ? (todoTasks.length / totalTasks) * 100 : 0;
  const inProgressPercent = totalTasks > 0 ? (inProgressTasks.length / totalTasks) * 100 : 0;
  const donePercent = totalTasks > 0 ? (doneTasks.length / totalTasks) * 100 : 0;

  return (
    <div className="min-h-screen bg-muted/30">
      <Navigation />

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/events")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Eventos
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{event.title}</h1>
              <p className="text-muted-foreground mb-3">{event.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(event.eventDate), "dd/MM/yyyy", { locale: ptBR })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {event.eventTime}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {event.confirmedParticipants}/{event.maxParticipants} participantes
                </span>
              </div>
            </div>

            {canEdit() && (
              <Button onClick={() => { setTaskToEdit(null); setIsTaskModalOpen(true); }} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nova Tarefa
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{tasks.length}</p>
              <p className="text-xs text-muted-foreground">Total de Tarefas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-600">{todoTasks.length}</p>
              <p className="text-xs text-muted-foreground">A Fazer</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{inProgressTasks.length}</p>
              <p className="text-xs text-muted-foreground">Em Andamento</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{doneTasks.length}</p>
              <p className="text-xs text-muted-foreground">Concluídas</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        {totalTasks > 0 && (
          <Card className="mb-6">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Progresso do Evento</h3>
                <span className="text-sm font-bold text-green-600">{progressPercent}% concluído</span>
              </div>

              {/* Segmented bar */}
              <div className="w-full h-5 bg-gray-100 rounded-full overflow-hidden flex">
                {donePercent > 0 && (
                  <div
                    className="h-full bg-green-500 transition-all duration-500 ease-in-out"
                    style={{ width: `${donePercent}%` }}
                    title={`Concluídas: ${doneTasks.length}`}
                  />
                )}
                {inProgressPercent > 0 && (
                  <div
                    className="h-full bg-blue-500 transition-all duration-500 ease-in-out"
                    style={{ width: `${inProgressPercent}%` }}
                    title={`Em Andamento: ${inProgressTasks.length}`}
                  />
                )}
                {todoPercent > 0 && (
                  <div
                    className="h-full bg-gray-300 transition-all duration-500 ease-in-out"
                    style={{ width: `${todoPercent}%` }}
                    title={`A Fazer: ${todoTasks.length}`}
                  />
                )}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
                  Concluídas ({doneTasks.length})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
                  Em Andamento ({inProgressTasks.length})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-gray-300 inline-block" />
                  A Fazer ({todoTasks.length})
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tasks List */}
        {tasks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">Nenhuma tarefa criada para este evento ainda.</p>
              {canEdit() && (
                <Button onClick={() => { setTaskToEdit(null); setIsTaskModalOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Tarefa
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col gap-3">
                    {/* Task Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-foreground">{task.title}</h3>
                          <Badge className={priorityColors[task.priority || 'média']}>
                            {task.priority || 'média'}
                          </Badge>
                          <Badge className={statusColors[task.status]}>
                            {statusLabels[task.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Vencimento: {format(new Date(task.dueDate), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>

                      {canEdit() && (
                        <div className="flex items-center gap-1">
                          <Select
                            value={task.status}
                            onValueChange={(val) => handleStatusChange(task.id, val)}
                          >
                            <SelectTrigger className="w-[140px] h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-background">
                              <SelectItem value="todo">A Fazer</SelectItem>
                              <SelectItem value="in-progress">Em Andamento</SelectItem>
                              <SelectItem value="done">Concluído</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-orange-500 hover:text-orange-600"
                            onClick={() => handleEditTask(task)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => setTaskToDelete({ id: task.id, title: task.title })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Assigned Volunteers */}
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          Voluntários Alocados ({task.taskUsers?.length || 0})
                        </span>
                        {canEdit() && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAssigningTaskId(assigningTaskId === task.id ? null : task.id)}
                            className="text-xs"
                          >
                            <UserPlus className="h-3 w-3 mr-1" />
                            Alocar
                          </Button>
                        )}
                      </div>

                      {/* Assigned users list */}
                      {task.taskUsers && task.taskUsers.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {task.taskUsers.map((tu) => (
                            <div key={tu.id} className="flex items-center gap-2 bg-muted/50 rounded-full py-1 px-3">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                  {tu.user?.fullName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{tu.user?.fullName || 'Usuário'}</span>
                              {canEdit() && (
                                <button
                                  onClick={() => handleUnassignUser(task.id, tu.userId)}
                                  className="hover:text-destructive ml-1"
                                  title="Remover voluntário"
                                >
                                  <UserMinus className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">Nenhum voluntário alocado</p>
                      )}

                      {/* Assign user dropdown */}
                      {canEdit() && assigningTaskId === task.id && (
                        <div className="mt-2">
                          <Select onValueChange={(val) => handleAssignUser(task.id, val)}>
                            <SelectTrigger className="h-9 text-sm">
                              <SelectValue placeholder="Selecionar voluntário para alocar..." />
                            </SelectTrigger>
                            <SelectContent className="bg-background">
                              {getAvailableUsersForTask(task).map((user) => (
                                <SelectItem key={user.id} value={user.id.toString()}>
                                  {user.fullName} ({user.role === 'coordinator' ? 'Coordenador' : 'Voluntário'})
                                </SelectItem>
                              ))}
                              {getAvailableUsersForTask(task).length === 0 && (
                                <SelectItem value="_none" disabled>
                                  Todos os voluntários já estão alocados
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <EventTaskModal
        open={isTaskModalOpen}
        onOpenChange={(open) => {
          setIsTaskModalOpen(open);
          if (!open) setTaskToEdit(null);
        }}
        eventId={+id!}
        eventTitle={event.title}
        onTaskCreated={loadData}
        taskToEdit={taskToEdit}
      />

      <DeleteTaskModal
        open={isDeleteModalOpen || !!taskToDelete}
        onOpenChange={(open) => {
          if (!open) setTaskToDelete(null);
          setIsDeleteModalOpen(open);
        }}
        taskTitle={taskToDelete?.title || ""}
        onConfirm={handleDeleteTask}
      />
    </div>
  );
};

export default EventDetail;
