import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import EventCard from "@/components/EventCard";
import NewEventModal from "@/components/modals/NewEventModal";
import DeleteEventModal from "@/components/modals/DeleteEventModal";
import { eventsService, Event as ApiEvent } from "@/services/events.service";
import { Task as ApiTask } from "@/services/tasks.service";
import { useAuth } from "@/contexts/AuthContext";
import { handleApiError } from "@/lib/error-handler";

interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
}

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  volunteersConfirmed: string;
  maxParticipants?: number;
  status: "confirmed" | "planned";
  deleted?: boolean;
  taskStats?: TaskStats;
}

const Events = () => {
  const navigate = useNavigate();
  const { canEdit } = useAuth();
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<{ id: number; title: string } | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const data = await eventsService.getAll();
      console.log('API returned events:', data);
      
      // Transform API data to component format
      const transformedEvents: Event[] = data.map((event: ApiEvent) => {
        const tasks = (event.tasks || []) as ApiTask[];
        const taskStats: TaskStats = {
          total: tasks.length,
          todo: tasks.filter(t => t.status === 'todo').length,
          inProgress: tasks.filter(t => t.status === 'in-progress').length,
          done: tasks.filter(t => t.status === 'done').length,
        };
        return {
          id: event.id,
          title: event.title,
          description: event.description,
          date: new Date(event.eventDate).toLocaleDateString('pt-BR'),
          time: event.eventTime,
          location: event.location,
          volunteersConfirmed: `${event.confirmedParticipants}/${event.maxParticipants} voluntários confirmados`,
          maxParticipants: event.maxParticipants,
          status: event.status as "confirmed" | "planned",
          deleted: false,
          taskStats,
        };
      });

      setEvents(transformedEvents);
    } catch (error) {
      console.error("Failed to load events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = (event: Event) => {
    setEventToEdit(event);
    setIsNewEventModalOpen(true);
  };

  const handleEditComplete = () => {
    setIsNewEventModalOpen(false);
    setEventToEdit(null);
    loadEvents(); // Reload events after edit
  };

  const handleModalClose = (open: boolean) => {
    setIsNewEventModalOpen(open);
    if (!open) {
      setEventToEdit(null);
    }
  };

  const handleDeleteEvent = (eventId: number, eventTitle: string) => {
    setEventToDelete({ id: eventId, title: eventTitle });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (eventToDelete) {
      try {
        await eventsService.delete(eventToDelete.id);
        loadEvents(); // Reload events after delete
      } catch (error: any) {
        console.error("Failed to delete event:", error);
        handleApiError(error, "Falha ao excluir evento");
      }
      setEventToDelete(null);
    }
  };

  // Filtra apenas eventos não deletados
  const activeEvents = events.filter(event => !event.deleted);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Carregando eventos...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Navigation />
      
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Agenda de Eventos</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Abaixo a lista completa de eventos.</p>
          </div>
          
          {canEdit() && (
            <Button 
              className="flex items-center gap-2"
              onClick={() => setIsNewEventModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Novo Evento
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Eventos Programados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeEvents.map((event) => (
                <EventCard
                  key={event.id}
                  id={event.id}
                  title={event.title}
                  description={event.description}
                  date={event.date}
                  time={event.time}
                  location={event.location}
                  volunteersConfirmed={event.volunteersConfirmed}
                  maxParticipants={event.maxParticipants}
                  status={event.status}
                  taskStats={event.taskStats}
                  onEdit={handleEditEvent}
                  onDelete={handleDeleteEvent}
                  canEdit={canEdit()}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <NewEventModal 
          open={isNewEventModalOpen}
          onOpenChange={handleModalClose}
          eventToEdit={eventToEdit}
          onEditComplete={handleEditComplete}
        />

        <DeleteEventModal
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          eventTitle={eventToDelete?.title || ""}
          onConfirm={handleConfirmDelete}
        />
      </div>
    </div>
  );
};

export default Events;