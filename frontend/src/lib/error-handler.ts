import { toast } from "sonner";

export const handleApiError = (error: any, defaultMessage: string = "Ocorreu um erro") => {
  if (error.statusCode === 403) {
    // Erro de permissão
    toast.error("Acesso Negado", {
      description: error.message || error.detail || "Você não tem permissão para realizar esta ação. Entre em contato com o coordenador da sua organização.",
      duration: 6000,
    });
  } else if (error.message) {
    toast.error("Erro", {
      description: error.message,
      duration: 4000,
    });
  } else {
    toast.error("Erro", {
      description: defaultMessage,
      duration: 4000,
    });
  }
};

export const showSuccessMessage = (title: string, description?: string) => {
  toast.success(title, {
    description,
    duration: 3000,
  });
};

export const showPermissionDeniedMessage = () => {
  toast.error("Permissão Negada", {
    description: "Você não tem permissão para realizar esta ação. Esta funcionalidade é restrita a Coordenadores e Administradores. Entre em contato com o coordenador da sua organização.",
    duration: 6000,
  });
};
