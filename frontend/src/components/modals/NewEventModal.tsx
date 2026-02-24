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
import { eventsService, CreateEventDto } from "@/services/events.service";

interface EventData {
  id?: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  volunteersConfirmed: string;
  maxParticipants?: number;
  status?: "confirmed" | "planned";
}

interface NewEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventToEdit?: EventData | null;
  onEditComplete?: () => void;
}

interface EventFormData {
  name: string;
  description: string;
  time: string;
  location: string;
  maxVolunteers: string;
}

const NewEventModal = ({ open, onOpenChange, eventToEdit, onEditComplete }: NewEventModalProps) => {
  const [date, setDate] = useState<Date>();
  const [selectedMaxVolunteers, setSelectedMaxVolunteers] = useState<string>("");
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<EventFormData>();
  const isEditing = !!eventToEdit;

  const maxVolunteersOptions = Array.from({ length: 20 }, (_, i) => `${i + 1}`);

  const onSubmit = async (data: EventFormData) => {
    if (!date) {
      toast({
        title: "Data obrigatória",
        description: "Por favor, selecione uma data para o evento.",
        variant: "destructive",
      });
      return;
    }

    try {
      const eventData: CreateEventDto = {
        title: data.name,
        description: data.description,
        eventDate: date.toISOString().split('T')[0],
        eventTime: data.time,
        location: data.location,
        maxParticipants: parseInt(selectedMaxVolunteers) || 10,
        status: 'planned',
      };

      console.log('Submitting event data:', eventData);
      console.log('Is editing?', isEditing);

      if (isEditing && eventToEdit) {
        console.log('Updating event:', eventToEdit.id);
        await eventsService.update(eventToEdit.id!, eventData);
        toast({
          title: "Evento editado com sucesso!",
          description: `O evento "${data.name}" foi atualizado.`,
        });
      } else {
        console.log('Creating new event');
        const result = await eventsService.create(eventData);
        console.log('Event created:', result);
        toast({
          title: "Evento criado com sucesso!",
          description: `O evento "${data.name}" foi criado.`,
        });
      }

      reset();
      setDate(undefined);
      setSelectedMaxVolunteers("");
      onOpenChange(false);

      console.log('Calling onEditComplete');
      if (onEditComplete) {
        onEditComplete();
      }
    } catch (error) {
      console.error('Failed to save event:', error);
      toast({
        title: "Erro ao salvar evento",
        description: "Não foi possível salvar o evento. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const parseDate = (dateString: string): Date | undefined => {
    if (!dateString) return undefined;
    
    // Formato esperado: "30/11/2025"
    const dateParts = dateString.split('/');
    if (dateParts.length === 3) {
      const [day, month, year] = dateParts;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    return undefined;
  };

  useEffect(() => {
    if (eventToEdit && open) {
      setValue("name", eventToEdit.title);
      setValue("description", eventToEdit.description);
      setValue("time", eventToEdit.time);
      setValue("location", eventToEdit.location);
      
      const maxVol = eventToEdit.maxParticipants ? eventToEdit.maxParticipants.toString() : "10";
      setValue("maxVolunteers", maxVol);
      setSelectedMaxVolunteers(maxVol);
      
      if (eventToEdit.date) {
        const eventDate = parseDate(eventToEdit.date);
        setDate(eventDate);
      }
    } else if (!open) {
      // Limpa o formulário quando o modal fecha
      reset();
      setDate(undefined);
      setSelectedMaxVolunteers("");
    }
  }, [eventToEdit, open, setValue, reset]);

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
            {isEditing ? "Editar Evento" : "Criar Novo Evento"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              {...register("name", { required: "Nome do evento é obrigatório" })}
              placeholder="Nome do evento"
              className="h-12 border-2 border-primary/30 focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {errors.name && (
              <span className="text-sm text-destructive">{errors.name.message}</span>
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

          <div className="flex gap-2">
            <Input
              {...register("time", { required: "Horário é obrigatório" })}
              placeholder="hh/mm"
              className="h-12 border-2 border-primary/30 focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "flex-1 h-12 justify-start text-left font-normal border-2 border-primary/30 focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0",
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
            <Input
              {...register("location", { required: "Local é obrigatório" })}
              placeholder="Local"
              className="h-12 border-2 border-primary/30 focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {errors.location && (
              <span className="text-sm text-destructive">{errors.location.message}</span>
            )}
          </div>

          <div>
            <Select value={selectedMaxVolunteers} onValueChange={(value) => {
              setSelectedMaxVolunteers(value);
              setValue("maxVolunteers", value);
            }}>
              <SelectTrigger className="h-12 border-2 border-primary/30 focus:border-primary focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="Máximo de voluntários" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border max-h-48">
                {maxVolunteersOptions.map((num) => (
                  <SelectItem key={num} value={num}>
                    {num} voluntário{num !== "1" ? "s" : ""}
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

export default NewEventModal;