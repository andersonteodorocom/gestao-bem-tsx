import { ArrowRight, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Draggable } from "@hello-pangea/dnd";

interface TaskCardProps {
  id: number;
  title: string;
  description: string;
  assignee: string;
  assigneeId?: number;
  dueDate: string;
  status: "todo" | "in-progress" | "done";
  priority?: string;
  index: number;
  onAdvance?: () => void;
  onEdit?: (task: {
    id: number;
    title: string;
    description: string;
    assignee: string;
    assigneeId?: number;
    dueDate: string;
    status: "todo" | "in-progress" | "done";
    priority?: string;
  }) => void;
  onSoftDelete?: () => void;
  canEdit?: boolean;
}

const TaskCard = ({ id, title, description, assignee, assigneeId, dueDate, status, priority, index, onAdvance, onEdit, onSoftDelete, canEdit = true }: TaskCardProps) => {
  const getStatusColor = () => {
    switch (status) {
      case "todo":
        return "border-l-destructive";
      case "in-progress":
        return "border-l-warning";
      case "done":
        return "border-l-primary";
      default:
        return "border-l-muted";
    }
  };

  const getBackgroundColor = () => {
    switch (status) {
      case "todo":
        return "bg-white";
      case "in-progress":
        return "bg-yellow-50/50";
      case "done":
        return "bg-green-50/50";
      default:
        return "bg-white";
    }
  };

  return (
    <Draggable draggableId={id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Card 
            className={`border-l-4 ${getStatusColor()} ${getBackgroundColor()} hover:shadow-md transition-shadow ${
              snapshot.isDragging ? 'rotate-3 shadow-lg' : ''
            }`}
          >
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{description}</p>
              
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-muted-foreground">Prazo: {dueDate}</span>
                <span className="font-medium text-foreground">{assignee}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 text-primary hover:text-primary"
                  onClick={onAdvance}
                  disabled={status === 'done'}
                >
                  {status === 'done' ? 'Concluído' : 'Avançar'}
                  {status !== 'done' && <ArrowRight className="h-4 w-4" />}
                </Button>
                
                <div className="flex items-center gap-1">
                  {canEdit && onEdit && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                      onClick={() => onEdit({ id, title, description, assignee, assigneeId, dueDate, status, priority })}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {canEdit && onSoftDelete && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={onSoftDelete}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;