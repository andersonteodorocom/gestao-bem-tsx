import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import VolunteerCard from "@/components/VolunteerCard";
import type { VolunteerTask } from "@/components/VolunteerCard";
import NewVolunteerModal from "@/components/modals/NewVolunteerModal";
import { usersService, User as ApiUser } from "@/services/users.service";
import { tasksService, Task as ApiTask } from "@/services/tasks.service";
import { useAuth } from "@/contexts/AuthContext";
import { handleApiError } from "@/lib/error-handler";

interface Volunteer {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  skills: string[];
  actionsCount: number;
  status: "active" | "inactive";
  allocatedTasks: VolunteerTask[];
}

const Volunteers = () => {
  const navigate = useNavigate();
  const { canEdit } = useAuth();
  const [isNewVolunteerModalOpen, setIsNewVolunteerModalOpen] = useState(false);
  const [volunteerToEdit, setVolunteerToEdit] = useState<Volunteer | null>(
    null
  );
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVolunteers();
  }, []);

  const loadVolunteers = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const [data, allTasks] = await Promise.all([
        usersService.getAll(),
        tasksService.getAll(),
      ]);
      console.log("API returned users:", data);

      // Build map: userId -> tasks (from taskUsers N:N + legacy assigneeId)
      const userTaskMap = new Map<number, VolunteerTask[]>();
      allTasks.forEach((task: ApiTask) => {
        // N:N assignments via task_users
        if (task.taskUsers && task.taskUsers.length > 0) {
          task.taskUsers.forEach(tu => {
            const list = userTaskMap.get(tu.userId) || [];
            list.push({
              id: task.id,
              title: task.title,
              status: task.status,
              eventTitle: task.event?.title,
            });
            userTaskMap.set(tu.userId, list);
          });
        }
        // Legacy single assignee
        if (task.assigneeId) {
          const existing = userTaskMap.get(task.assigneeId) || [];
          // Avoid duplicate if already added via taskUsers
          if (!existing.find(t => t.id === task.id)) {
            existing.push({
              id: task.id,
              title: task.title,
              status: task.status,
              eventTitle: task.event?.title,
            });
            userTaskMap.set(task.assigneeId, existing);
          }
        }
      });

      // Transform API data to component format
      const transformedVolunteers: Volunteer[] = data.map((user: ApiUser) => {
        const volunteer = {
          id: user.id,
          name: user.fullName,
          role:
            user.role === "coordinator" || user.role === "admin"
              ? "Coordenador"
              : "Voluntário",
          email: user.email,
          phone: user.phone || "Não informado",
          skills: user.skills && user.skills.length > 0 ? user.skills : [],
          actionsCount: user.actionsCount,
          status: user.status,
          allocatedTasks: userTaskMap.get(user.id) || [],
        };
        console.log(
          "Transformed volunteer:",
          volunteer.name,
          "skills:",
          volunteer.skills
        );
        return volunteer;
      });

      setVolunteers(transformedVolunteers);
    } catch (error) {
      console.error("Failed to load volunteers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditVolunteer = (volunteer: Volunteer) => {
    setVolunteerToEdit(volunteer);
    setIsNewVolunteerModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsNewVolunteerModalOpen(false);
    setVolunteerToEdit(null);
  };

  const handleEditComplete = () => {
    setIsNewVolunteerModalOpen(false);
    setVolunteerToEdit(null);
    loadVolunteers(); // Reload after edit
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Carregando voluntários...
      </div>
    );
  }

  const handleToggleStatus = async (
    volunteerId: number,
    newStatus: "active" | "inactive"
  ) => {
    try {
      await usersService.toggleStatus(volunteerId);
      setVolunteers((prevVolunteers) =>
        prevVolunteers.map((volunteer) =>
          volunteer.id === volunteerId
            ? { ...volunteer, status: newStatus }
            : volunteer
        )
      );
    } catch (error: any) {
      console.error("Failed to toggle status:", error);
      handleApiError(error, "Falha ao alterar status do voluntário");
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Navigation />

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Gestão de Voluntários
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Lista de voluntários cadastrados no sistema.
            </p>
          </div>

          {canEdit() && (
            <Button
              className="flex items-center gap-2"
              onClick={() => {
                setVolunteerToEdit(null);
                setIsNewVolunteerModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Novo Voluntário
            </Button>
          )}
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">Todos ({volunteers.length})</TabsTrigger>
            <TabsTrigger value="active">
              Ativos ({volunteers.filter((v) => v.status === "active").length})
            </TabsTrigger>
            <TabsTrigger value="inactive">
              Inativos (
              {volunteers.filter((v) => v.status === "inactive").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {volunteers.map((volunteer) => (
                <VolunteerCard
                  key={volunteer.id}
                  id={volunteer.id}
                  name={volunteer.name}
                  role={volunteer.role}
                  email={volunteer.email}
                  phone={volunteer.phone}
                  skills={volunteer.skills}
                  actionsCount={volunteer.actionsCount}
                  status={volunteer.status}
                  allocatedTasks={volunteer.allocatedTasks}
                  onEdit={handleEditVolunteer}
                  onToggleStatus={handleToggleStatus}
                  canEdit={canEdit()}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="active">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {volunteers
                .filter((volunteer) => volunteer.status === "active")
                .map((volunteer) => (
                  <VolunteerCard
                    key={volunteer.id}
                    id={volunteer.id}
                    name={volunteer.name}
                    role={volunteer.role}
                    email={volunteer.email}
                    phone={volunteer.phone}
                    skills={volunteer.skills}
                    actionsCount={volunteer.actionsCount}
                    status={volunteer.status}
                    allocatedTasks={volunteer.allocatedTasks}
                    onEdit={handleEditVolunteer}
                    onToggleStatus={handleToggleStatus}
                    canEdit={canEdit()}
                  />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="inactive">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {volunteers
                .filter((volunteer) => volunteer.status === "inactive")
                .map((volunteer) => (
                  <VolunteerCard
                    key={volunteer.id}
                    id={volunteer.id}
                    name={volunteer.name}
                    role={volunteer.role}
                    email={volunteer.email}
                    phone={volunteer.phone}
                    skills={volunteer.skills}
                    actionsCount={volunteer.actionsCount}
                    status={volunteer.status}
                    allocatedTasks={volunteer.allocatedTasks}
                    onEdit={handleEditVolunteer}
                    onToggleStatus={handleToggleStatus}
                    canEdit={canEdit()}
                  />
                ))}
            </div>
          </TabsContent>
        </Tabs>

        <NewVolunteerModal
          open={isNewVolunteerModalOpen}
          onOpenChange={setIsNewVolunteerModalOpen}
          volunteerToEdit={volunteerToEdit}
          onEditComplete={handleEditComplete}
        />
      </div>
    </div>
  );
};

export default Volunteers;
