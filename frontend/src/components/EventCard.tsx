import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
}

interface EventCardProps {
  id?: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  volunteersConfirmed: string;
  maxParticipants?: number;
  status: "confirmed" | "planned";
  taskStats?: TaskStats;
  onEdit?: (event: {
    id?: number;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    volunteersConfirmed: string;
    maxParticipants?: number;
    status: "confirmed" | "planned";
  }) => void;
  onDelete?: (eventId: number, eventTitle: string) => void;
  canEdit?: boolean;
}

const EventCard = ({ 
  id,
  title, 
  description, 
  date, 
  time, 
  location, 
  volunteersConfirmed,
  maxParticipants,
  status,
  taskStats,
  onEdit,
  onDelete,
  canEdit = true
}: EventCardProps) => {
  const navigate = useNavigate();
  const getStatusBadge = () => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Confirmado</Badge>;
      case "planned":
        return <Badge variant="secondary">Planejado</Badge>;
      default:
        return <Badge variant="secondary">Planejado</Badge>;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 bg-secondary">
            <AvatarFallback className="bg-secondary text-secondary-foreground">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              {getStatusBadge()}
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{date}</span>
                <span className="text-muted-foreground">{time}</span>
              </div>
              <p className="text-sm text-muted-foreground">{location}</p>
            </div>
            
            {/* Task Progress Bar */}
            {taskStats && taskStats.total > 0 && (() => {
              const donePercent = (taskStats.done / taskStats.total) * 100;
              const inProgressPercent = (taskStats.inProgress / taskStats.total) * 100;
              const todoPercent = (taskStats.todo / taskStats.total) * 100;
              const progressPercent = Math.round(donePercent);
              return (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-muted-foreground">Tarefas</span>
                    <span className="text-xs font-bold text-green-600">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden flex">
                    {donePercent > 0 && (
                      <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${donePercent}%` }} />
                    )}
                    {inProgressPercent > 0 && (
                      <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${inProgressPercent}%` }} />
                    )}
                    {todoPercent > 0 && (
                      <div className="h-full bg-gray-300 transition-all duration-500" style={{ width: `${todoPercent}%` }} />
                    )}
                  </div>
                  <div className="flex gap-3 mt-1 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />{taskStats.done} concluída{taskStats.done !== 1 ? 's' : ''}</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />{taskStats.inProgress} andamento</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />{taskStats.todo} a fazer</span>
                  </div>
                </div>
              );
            })()}

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {volunteersConfirmed}
              </p>
              
              <div className="flex items-center gap-2">
                {id && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-primary hover:text-primary/80 hover:bg-primary/10"
                    onClick={() => navigate(`/events/${id}`)}
                  >
                    <ClipboardList className="h-4 w-4 mr-1" />
                    Tarefas
                  </Button>
                )}
                
                {canEdit && onEdit && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                    onClick={() => onEdit({ id, title, description, date, time, location, volunteersConfirmed, maxParticipants, status })}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                
                {canEdit && onDelete && id && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => onDelete(id, title)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;