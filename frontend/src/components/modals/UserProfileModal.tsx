import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiClient } from "@/services/api";

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserProfileModal = ({ open, onOpenChange }: UserProfileModalProps) => {
  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    phone: "",
    organizationName: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Carregar dados do perfil quando o modal abrir
  useEffect(() => {
    if (open) {
      loadUserProfile();
    }
  }, [open]);

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const data = await apiClient.get<any>("/auth/profile");
      setUserData({
        fullName: data.fullName || "",
        email: data.email || "",
        phone: data.phone || "",
        organizationName: data.organization?.name || "",
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: ""
      });
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setUserData(prev => ({ ...prev, [field]: value }));
    setError("");
    setSuccess("");
  };

  const handleSaveProfile = async () => {
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      // Validações
      if (!userData.fullName.trim()) {
        setError("Nome completo é obrigatório");
        return;
      }

      if (!userData.email.trim()) {
        setError("Email é obrigatório");
        return;
      }

      // Validação de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        setError("Por favor, insira um email válido");
        return;
      }

      // Se está tentando alterar senha
      if (userData.newPassword || userData.confirmNewPassword) {
        if (!userData.currentPassword) {
          setError("Para alterar a senha, informe a senha atual");
          return;
        }

        if (userData.newPassword !== userData.confirmNewPassword) {
          setError("Nova senha e confirmação não coincidem");
          return;
        }

        if (userData.newPassword.length < 6) {
          setError("Nova senha deve ter pelo menos 6 caracteres");
          return;
        }
      }

      // Chamar API para atualizar perfil
      const token = localStorage.getItem("accessToken");
      
      const payload = {
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone || null,
        currentPassword: userData.currentPassword || undefined,
        newPassword: userData.newPassword || undefined,
      };

      console.log("Sending update profile request:", payload);

      const result = await apiClient.patch<any>("/auth/profile", payload);
      console.log("Profile updated successfully:", result);

      setSuccess("Perfil atualizado com sucesso!");
      
      // Limpar campos de senha
      setUserData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: ""
      }));

    } catch (error: any) {
      console.error("Error updating profile:", error);
      setError(error.message || "Erro ao atualizar perfil. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    setSuccess("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setUserData(prev => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: ""
    }));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            Perfil do Usuário
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert variant="default" className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">
              Nome Completo
            </label>
            <Input
              value={userData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              placeholder="Seu nome completo"
              className="h-12 border-2 border-primary/30 focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">
              Email
            </label>
            <Input
              type="email"
              value={userData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Seu email"
              className="h-12 border-2 border-primary/30 focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">
              Telefone
            </label>
            <Input
              value={userData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="Seu telefone"
              className="h-12 border-2 border-primary/30 focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">
              Organização
            </label>
            <Input
              value={userData.organizationName}
              disabled
              placeholder="Nome da organização"
              className="h-12 border-2 border-primary/30 bg-muted"
            />
          </div>

          <div className="pt-2 border-t">
            <h3 className="text-sm font-semibold mb-3">Alterar Senha (opcional)</h3>
          </div>

          <div className="relative">
            <Input
              type={showCurrentPassword ? "text" : "password"}
              value={userData.currentPassword}
              onChange={(e) => handleInputChange("currentPassword", e.target.value)}
              placeholder="Senha atual (para alterar senha)"
              className="h-12 border-2 border-primary/30 focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0 pr-12"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>

          <div className="relative">
            <Input
              type={showNewPassword ? "text" : "password"}
              value={userData.newPassword}
              onChange={(e) => handleInputChange("newPassword", e.target.value)}
              placeholder="Nova senha (opcional)"
              className="h-12 border-2 border-primary/30 focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0 pr-12"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>

          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              value={userData.confirmNewPassword}
              onChange={(e) => handleInputChange("confirmNewPassword", e.target.value)}
              placeholder="Confirmar nova senha"
              className="h-12 border-2 border-primary/30 focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0 pr-12"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleSaveProfile}
              disabled={isLoading}
              className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            >
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
            <Button 
              variant="secondary"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 h-12 bg-muted hover:bg-muted/80 text-muted-foreground font-medium"
            >
              Cancelar
            </Button>
          </div>
        </div>


      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;
