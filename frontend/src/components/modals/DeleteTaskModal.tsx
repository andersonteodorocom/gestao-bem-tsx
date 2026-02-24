import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface DeleteTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskTitle: string;
  onConfirm: () => void;
}

const DeleteTaskModal = ({ open, onOpenChange, taskTitle, onConfirm }: DeleteTaskModalProps) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Confirmar Exclusão
          </DialogTitle>
          <DialogDescription className="text-gray-500 mt-2">
            Tem certeza que deseja excluir a tarefa <span className="font-medium text-gray-900">"{taskTitle}"</span>?
            <br />
            Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-3 pt-4">
          <Button
            variant="destructive"
            onClick={handleConfirm}
            className="flex-1 h-12 font-medium"
          >
            Excluir Tarefa
          </Button>
          <Button
            variant="secondary"
            onClick={handleCancel}
            className="flex-1 h-12 bg-muted hover:bg-muted/80 text-muted-foreground font-medium"
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTaskModal;