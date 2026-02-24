import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { usersService } from "@/services/users.service";

interface VolunteerData {
  id?: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  skills: string[];
  actionsCount?: number;
  status?: "active" | "inactive";
}

interface NewVolunteerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  volunteerToEdit?: VolunteerData | null;
  onEditComplete?: () => void;
}

interface VolunteerFormData {
  name: string;
  email: string;
  phone: string;
  role: string;
  skills: string;
  password?: string;
}

const NewVolunteerModal = ({ open, onOpenChange, volunteerToEdit, onEditComplete }: NewVolunteerModalProps) => {
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<VolunteerFormData>();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!volunteerToEdit;

  const roleMapping: Record<string, string> = {
    "Voluntário": "volunteer",
    "Coordenador": "coordinator",
    "volunteer": "Voluntário",
    "coordinator": "Coordenador",
  };

  const roles = ["Voluntário", "Coordenador"];

  const onSubmit = async (data: VolunteerFormData) => {
    console.log('Form data submitted:', data);
    setIsLoading(true);
    try {
      const roleValue = roleMapping[data.role] || "volunteer";
      console.log('Role mapping:', { original: data.role, mapped: roleValue });
      
      if (isEditing && volunteerToEdit) {
        const skillsArray = data.skills ? data.skills.split(',').map(s => s.trim()).filter(s => s) : [];
        const updatePayload = {
          fullName: data.name,
          email: data.email,
          phone: data.phone,
          role: roleValue as 'coordinator' | 'volunteer',
          skills: skillsArray,
        };
        console.log('Update payload:', updatePayload);
        await usersService.update(volunteerToEdit.id!, updatePayload);
        
        toast({
          title: "Voluntário editado com sucesso!",
          description: `${data.name} foi atualizado no sistema.`,
        });
      } else {
        const skillsArray = data.skills ? data.skills.split(',').map(s => s.trim()).filter(s => s) : [];
        const createPayload = {
          fullName: data.name,
          email: data.email,
          phone: data.phone,
          role: roleValue as 'coordinator' | 'volunteer',
          password: data.password || '123456', // Default password
          skills: skillsArray,
        };
        console.log('Create payload:', createPayload);
        await usersService.create(createPayload);
        
        toast({
          title: "Voluntário cadastrado com sucesso!",
          description: `${data.name} foi adicionado ao sistema. Senha padrão: 123456`,
        });
      }
      
      reset();
      onOpenChange(false);
      if (onEditComplete) {
        onEditComplete();
      }
    } catch (error: any) {
      console.error('Error saving volunteer:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar voluntário",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (volunteerToEdit && open) {
      setValue("name", volunteerToEdit.name);
      setValue("email", volunteerToEdit.email);
      setValue("phone", volunteerToEdit.phone);
      setValue("role", roleMapping[volunteerToEdit.role] || volunteerToEdit.role);
      setValue("skills", volunteerToEdit.skills.join(", "));
    } else if (open) {
      reset();
    }
  }, [volunteerToEdit, open, setValue, reset]);

  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            {isEditing ? "Editar Voluntário" : "Novo Voluntário"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              {...register("name", { required: "Nome completo é obrigatório" })}
              placeholder="Nome completo"
              className="h-12 border-2 border-primary/30 focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {errors.name && (
              <span className="text-sm text-destructive">{errors.name.message}</span>
            )}
          </div>

          <div>
            <Input
              {...register("email", { 
                required: "Email é obrigatório",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Email inválido"
                }
              })}
              placeholder="Email"
              type="email"
              className="h-12 border-2 border-primary/30 focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {errors.email && (
              <span className="text-sm text-destructive">{errors.email.message}</span>
            )}
          </div>

          <div>
            <Input
              {...register("phone", { required: "Telefone é obrigatório" })}
              placeholder="Telefone"
              className="h-12 border-2 border-primary/30 focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {errors.phone && (
              <span className="text-sm text-destructive">{errors.phone.message}</span>
            )}
          </div>

          <div>
            <Select onValueChange={(value) => setValue("role", value)}>
              <SelectTrigger className="h-12 border-2 border-primary/30 focus:border-primary focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="Selecione o papel" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border">
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Textarea
              {...register("skills")}
              placeholder="Habilidades (separar por vírgula) - Opcional"
              className="min-h-[80px] border-2 border-primary/30 focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
            />
          </div>

          {!isEditing && (
            <div>
              <Input
                {...register("password")}
                placeholder="Senha (deixe vazio para senha padrão: 123456)"
                type="password"
                className="h-12 border-2 border-primary/30 focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Se não informar, a senha padrão será: 123456
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit"
              disabled={isLoading}
              className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            >
              {isLoading ? "Salvando..." : (isEditing ? "Salvar Alterações" : "Cadastrar")}
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

export default NewVolunteerModal;