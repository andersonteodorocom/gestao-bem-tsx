import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
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

interface TaskData {
  id?: number;
  title: string;
  description: string;
  assignee: string;
  assigneeId?: number;
  dueDate: string;
  status?: "todo" | "in-progress" | "done";
  priority?: string;
}

interface NewTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskToEdit?: TaskData | null;
  onEditComplete?: () => void;
}

interface TaskFormData {
  title: string;
  description: string;
  assignee: string;
  dueDate: Date;
  priority: string;
}

const NewTaskModal = ({ open, onOpenChange, taskToEdit, onEditComplete }: NewTaskModalProps) => {
  const [date, setDate] = useState<Date>();
  const [selectedAssignee, setSelectedAssignee] = useState<string>("");
  const [selectedPriority, setSelectedPriority] = useState<string>("");
  const [volunteers, setVolunteers] = useState<User[]>([]);
  const [loadingVolunteers, setLoadingVolunteers] = useState(false);
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<TaskFormData>();
  const isEditing = !!taskToEdit;

  useEffect(() => {
    if (open) {
      loadVolunteers();
    }
  }, [open]);

  const loadVolunteers = async () => {
    setLoadingVolunteers(true);
    try {
      const data = await usersService.getAll();
      setVolunteers(data);
    } catch (error) {
      console.error("Failed to load volunteers:", error);
      toast({
        title: "Erro ao carregar voluntários",
        description: "Não foi possível carregar a lista de voluntários.",
        variant: "destructive",
      });
    } finally {
      setLoadingVolunteers(false);
    }
  };

  const priorities = [
    { value: "baixa", label: "Baixa" },
    { value: "média", label: "Média" },
    { value: "alta", label: "Alta" },
    { value: "urgente", label: "Urgente" }
  ];

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
      const assigneeIdNum = selectedAssignee ? parseInt(selectedAssignee) : undefined;
      
      console.log('=== SUBMIT DATA ===');
      console.log('selectedAssignee:', selectedAssignee);
      console.log('assigneeIdNum:', assigneeIdNum);
      console.log('taskToEdit:', taskToEdit);
      
      const taskData: CreateTaskDto = {
        title: data.title,
        description: data.description,
        assigneeId: assigneeIdNum,
        dueDate: date.toISOString(),
        priority: selectedPriority as 'baixa' | 'média' | 'alta' | 'urgente' | undefined,
        status: taskToEdit?.status || 'todo',
      };

      console.log('taskData to send:', taskData);

      if (isEditing && taskToEdit) {
        await tasksService.update(taskToEdit.id!, taskData);
        toast({
          title: "Tarefa editada com sucesso!",
          description: `A tarefa "${data.title}" foi atualizada.`,
        });
      } else {
        await tasksService.create(taskData);
        toast({
          title: "Tarefa criada com sucesso!",
          description: `A tarefa "${data.title}" foi criada.`,
        });
      }
      
      reset();
      setDate(undefined);
      setSelectedAssignee("");
      setSelectedPriority("");
      onOpenChange(false);
      
      if (onEditComplete) {
        onEditComplete();
      }
    } catch (error) {
      console.error('Failed to save task:', error);
      toast({
        title: "Erro ao salvar tarefa",
        description: "Não foi possível salvar a tarefa. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const parseDate = (dateString: string): Date | undefined => {
    if (!dateString) return undefined;
    
    // Formato esperado: "23/11-2025" ou "23/11/2025"
    const dateParts = dateString.replace('-', '/').split('/');
    if (dateParts.length === 3) {
      const [day, month, year] = dateParts;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    return undefined;
  };

  useEffect(() => {
    if (taskToEdit && open) {
      console.log('Loading task to edit:', taskToEdit);
      console.log('AssigneeId:', taskToEdit.assigneeId);
      
      setValue("title", taskToEdit.title);
      setValue("description", taskToEdit.description);
      setValue("priority", taskToEdit.priority || "média");
      
      // Set assigneeId if available
      if (taskToEdit.assigneeId) {
        const assigneeIdStr = taskToEdit.assigneeId.toString();
        console.log('Setting selected assignee to:', assigneeIdStr);
        setSelectedAssignee(assigneeIdStr);
        setValue("assignee", taskToEdit.assignee);
      } else {
        console.log('No assigneeId, clearing');
        setSelectedAssignee("");
        setValue("assignee", "");
      }
      
      setSelectedPriority(taskToEdit.priority || "média");
      
      if (taskToEdit.dueDate) {
        const dueDate = parseDate(taskToEdit.dueDate);
        setDate(dueDate);
      }
    } else if (!open) {
      // Limpa o formulário quando o modal fecha
      reset();
      setDate(undefined);
      setSelectedAssignee("");
      setSelectedPriority("");
    }
  }, [taskToEdit, open, setValue, reset]);

  const handleCancel = () => {
    reset();
    setDate(undefined);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            {isEditing ? "Editar Tarefa" : "Criar Nova Tarefa"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              {...register("title", { required: "Título é obrigatório" })}
              placeholder="Título da tarefa"
              className="h-12 border-2 border-primary/30 focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {errors.title && (
              <span className="text-sm text-destructive">{errors.title.message}</span>
            )}
          </div>

          <div>
            <Textarea
              {...register("description", { required: "Descrição é obrigatória" })}
              placeholder="Descrição"
              className="min-h-[80px] border-2 border-primary/30 focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
            />
            {errors.description && (
              <span className="text-sm text-destructive">{errors.description.message}</span>
            )}
          </div>

          <div>
            <Select 
              key={`assignee-${selectedAssignee}-${open}`}
              value={selectedAssignee} 
              onValueChange={(value) => {
                console.log('Selected new assignee:', value);
                setSelectedAssignee(value);
                const selectedUser = volunteers.find(v => v.id.toString() === value);
                console.log('Found user:', selectedUser);
                setValue("assignee", selectedUser?.fullName || "");
              }}
            >
              <SelectTrigger className="h-12 border-2 border-primary/30 focus:border-primary focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder={loadingVolunteers ? "Carregando..." : "Atribuir para"} />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border">
                {volunteers.map((volunteer) => (
                  <SelectItem key={volunteer.id} value={volunteer.id.toString()}>
                    {volunteer.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 justify-start text-left font-normal border-2 border-primary/30 focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0",
                    !date && "text-muted-foreground"
                  )}
                >
                  {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "dd/mm/yyyy"}
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
            <Select value={selectedPriority} onValueChange={(value) => {
              setSelectedPriority(value);
              setValue("priority", value);
            }}>
              <SelectTrigger className="h-12 border-2 border-primary/30 focus:border-primary focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border">
                {priorities.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit"
              className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            >
              {isEditing ? "Salvar Alterações" : "Criar"}
            </Button>
            <Button 
              type="button"
              variant="secondary"
              onClick={handleCancel}
              className="flex-1 h-12 bg-muted hover:bg-muted/80 text-muted-foreground font-medium"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewTaskModal;