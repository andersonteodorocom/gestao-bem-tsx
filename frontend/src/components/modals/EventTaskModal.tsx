import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { CalendarIcon, Plus, X, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { tasksService, CreateTaskDto } from "@/services/tasks.service";
import { usersService, User } from "@/services/users.service";

interface EventTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: number;
  eventTitle: string;
  onTaskCreated?: () => void;
  taskToEdit?: {
    id?: number;
    title: string;
    description: string;
    dueDate: string;
    priority?: string;
    status?: string;
    assigneeIds?: number[];
  } | null;
}

interface TaskFormData {
  title: string;
  description: string;
}

const EventTaskModal = ({ open, onOpenChange, eventId, eventTitle, onTaskCreated, taskToEdit }: EventTaskModalProps) => {
  const [date, setDate] = useState<Date>();
  const [selectedPriority, setSelectedPriority] = useState<string>("média");
  const [volunteers, setVolunteers] = useState<User[]>([]);
  const [loadingVolunteers, setLoadingVolunteers] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [selectingUser, setSelectingUser] = useState<string>("");
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<TaskFormData>();
  const isEditing = !!taskToEdit;

  const priorities = [
    { value: "baixa", label: "Baixa" },
    { value: "média", label: "Média" },
    { value: "alta", label: "Alta" },
    { value: "urgente", label: "Urgente" }
  ];

  useEffect(() => {
    if (open) {
      loadVolunteers();
    }
  }, [open]);

  useEffect(() => {
    if (taskToEdit && open) {
      setValue("title", taskToEdit.title);
      setValue("description", taskToEdit.description);
      setSelectedPriority(taskToEdit.priority || "média");
      if (taskToEdit.assigneeIds) {
        setSelectedUserIds(taskToEdit.assigneeIds);
      }
      if (taskToEdit.dueDate) {
        const parts = taskToEdit.dueDate.replace('-', '/').split('/');
        if (parts.length === 3) {
          const [day, month, year] = parts;
          setDate(new Date(parseInt(year), parseInt(month) - 1, parseInt(day)));
        }
      }
    } else if (!open) {
      reset();
      setDate(undefined);
      setSelectedPriority("média");
      setSelectedUserIds([]);
      setSelectingUser("");
    }
  }, [taskToEdit, open, setValue, reset]);

  const loadVolunteers = async () => {
    setLoadingVolunteers(true);
    try {
      const data = await usersService.getAll();
      setVolunteers(data.filter(u => u.status === 'active'));
    } catch (error) {
      console.error("Failed to load volunteers:", error);
    } finally {
      setLoadingVolunteers(false);
    }
  };

  const addUser = (userId: string) => {
    const id = parseInt(userId);
    if (!selectedUserIds.includes(id)) {
      setSelectedUserIds([...selectedUserIds, id]);
    }
    setSelectingUser("");
  };

  const removeUser = (userId: number) => {
    setSelectedUserIds(selectedUserIds.filter(id => id !== userId));
  };

  const getUserName = (userId: number) => {
    const user = volunteers.find(v => v.id === userId);
    return user?.fullName || `Usuário #${userId}`;
  };

  const onSubmit = async (data: TaskFormData) => {
    if (!date) {
      toast({
        title: "Data obrigatória",
        description: "Por favor, selecione uma data de vencimento.",
        variant: "destructive",
      });
      return;
    }

    try {
      const taskData: CreateTaskDto = {
        title: data.title,
        description: data.description,
        dueDate: date.toISOString(),
        priority: selectedPriority as any,
        status: 'todo',
        eventId: eventId,
        assigneeIds: selectedUserIds.length > 0 ? selectedUserIds : undefined,
      };

      if (isEditing && taskToEdit?.id) {
        await tasksService.update(taskToEdit.id, taskData);
        toast({
          title: "Tarefa atualizada!",
          description: `A tarefa "${data.title}" foi atualizada.`,
        });
      } else {
        await tasksService.create(taskData);
        toast({
          title: "Tarefa criada!",
          description: `A tarefa "${data.title}" foi criada para o evento "${eventTitle}".`,
        });
      }

      reset();
      setDate(undefined);
      setSelectedPriority("média");
      setSelectedUserIds([]);
      onOpenChange(false);
      if (onTaskCreated) onTaskCreated();
    } catch (error) {
      console.error('Failed to save task:', error);
      toast({
        title: "Erro ao salvar tarefa",
        description: "Não foi possível salvar a tarefa. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const availableVolunteers = volunteers.filter(v => !selectedUserIds.includes(v.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            {isEditing ? "Editar Tarefa" : "Nova Tarefa do Evento"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground text-center">{eventTitle}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              {...register("title", { required: "Título é obrigatório" })}
              placeholder="Título da tarefa (ex: Montagem das tendas)"
              className="h-12 border-2 border-primary/30 focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {errors.title && (
              <span className="text-sm text-destructive">{errors.title.message}</span>
            )}
          </div>

          <div>
            <Textarea
              {...register("description", { required: "Descrição é obrigatória" })}
              placeholder="Descrição da tarefa"
              className="min-h-[80px] border-2 border-primary/30 focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
            />
            {errors.description && (
              <span className="text-sm text-destructive">{errors.description.message}</span>
            )}
          </div>

          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 justify-start text-left font-normal border-2 border-primary/30",
                    !date && "text-muted-foreground"
                  )}
                >
                  {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Data de vencimento"}
                  <CalendarIcon className="ml-auto h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="h-12 border-2 border-primary/30">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border">
                {priorities.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Multi-user assignment */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Voluntários Alocados</label>
            
            {selectedUserIds.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 bg-muted/50 rounded-md">
                {selectedUserIds.map(userId => (
                  <Badge key={userId} variant="secondary" className="flex items-center gap-1 py-1 px-2">
                    {getUserName(userId)}
                    <button
                      type="button"
                      onClick={() => removeUser(userId)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {availableVolunteers.length > 0 && (
              <Select 
                value={selectingUser} 
                onValueChange={addUser}
              >
                <SelectTrigger className="h-12 border-2 border-primary/30">
                  <SelectValue placeholder={
                    loadingVolunteers ? "Carregando..." : 
                    <span className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Adicionar voluntário
                    </span>
                  } />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border">
                  {availableVolunteers.map((v) => (
                    <SelectItem key={v.id} value={v.id.toString()}>
                      {v.fullName} {v.role === 'coordinator' ? '(Coordenador)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {selectedUserIds.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Nenhum voluntário alocado ainda. Selecione acima para alocar.
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            >
              {isEditing ? "Salvar Alterações" : "Criar Tarefa"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                reset();
                setDate(undefined);
                setSelectedUserIds([]);
                onOpenChange(false);
              }}
              className="flex-1 h-12"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventTaskModal;
