/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/services/api";
import { Users, ClipboardList, Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatCard from "@/components/StatCard";
import Navigation from "@/components/Navigation";

// Definindo tipos para os dados que virão da API
interface User {
  fullName: string;
}
interface Task {
  id: number;
  title: string;
  assignee: User;
  status: string;
}
interface Event {
  id: number;
  title: string;
  eventDate: string;
  confirmedParticipants: number;
  maxParticipants: number;
}
interface Stats {
  activeUsers: number;
  pendingTasks: number;
  upcomingEvents: number;
  actionsThisMonth: number;
}

const Dashboard = () => {
  // --- ESTADOS PARA GUARDAR OS DADOS DA API ---
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // --- useEffect para buscar os dados quando o componente montar ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        console.log("Token:", token ? "exists" : "missing");
        
        if (!token) {
          navigate("/login"); // Se não houver token, redireciona para o login
          return;
        }

        const data = await apiClient.get<any>("/dashboard/summary");
        console.log("Dashboard data received:", data);
        setStats(data.stats);
        setRecentTasks(data.recentTasks);
        setUpcomingEvents(data.upcomingEvents);
      } catch (err: any) {
        console.error("Dashboard error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // Funções de formatação (você já as tinha)
  const getStatusIndicator = (status: string) => {
    /* ... seu código ... */
  };

  // Renderiza um estado de carregamento
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Carregando...
      </div>
    );
  }

  // Renderiza um estado de erro
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Navigation />
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Bem-vindo de volta!</p>
        </div>

        {/* --- DADOS DINÂMICOS NOS CARDS DE ESTATÍSTICAS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Usuários Ativos"
            value={stats?.activeUsers.toString() || "0"}
            icon={Users}
          />
          <StatCard
            title="Tarefas Pendentes"
            value={stats?.pendingTasks.toString() || "0"}
            icon={ClipboardList}
          />
          <StatCard
            title="Próximos Eventos"
            value={stats?.upcomingEvents.toString() || "0"}
            icon={Calendar}
          />
          <StatCard
            title="Ações este Mês"
            value={stats?.actionsThisMonth.toString() || "0"}
            icon={TrendingUp}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* --- LISTA DINÂMICA DE TAREFAS --- */}
          <Card>
            <CardHeader>
              <CardTitle>Tarefas Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-3">
                    <div
                      className={`w-2 h-2 rounded-full ${getStatusIndicator(
                        task.status
                      )}`}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {task.assignee?.fullName || "Sem responsável"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* --- LISTA DINÂMICA DE EVENTOS --- */}
          <Card>
            <CardHeader>
              <CardTitle>Próximos Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3">
                    <div className="w-1 h-full bg-primary rounded-full" />
                    <div className="flex-1">
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.eventDate).toLocaleDateString("pt-BR")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {event.confirmedParticipants}/{event.maxParticipants}{" "}
                        participantes
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
