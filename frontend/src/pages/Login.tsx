/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import ForgotPasswordModal from "@/components/modals/ForgotPasswordModal";
import logoFull from "@/assets/logo-full.png";
import { apiClient } from "@/services/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(""); // <-- Estado para mensagens de erro do login
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const message = location.state?.message; // Mensagem de sucesso vinda do cadastro

  // A função de login agora é async e chama a API
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Limpa erros anteriores

    if (!email || !password) {
      setError("Email e senha são obrigatórios.");
      return;
    }

    try {
      const data = await apiClient.post<{ access_token: string }>("/auth/login", {
        email,
        password,
      });
      if (!data?.access_token) {
        setError("Token de acesso não recebido.");
        return;
      }
      await login(data.access_token);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Falha ao fazer login.");
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <img
              src={logoFull}
              alt="Gestão do Bem"
              className="h-20 mx-auto mb-4"
            />
            <p className="text-muted-foreground">
              Gerencie sua organização de forma simples e eficiente
            </p>
          </div>

          {/* Alerta para mensagem de sucesso vinda do cadastro */}
          {message && !error && (
            <Alert className="mb-4" variant="default">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {/* Alerta para erros de login */}
          {error && (
            <Alert className="mb-4" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 border-2 ..."
                required
              />
            </div>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 border-2 ..."
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-12 ..."
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="text-right">
              <Button 
                type="button"
                variant="link" 
                className="text-primary text-sm p-0"
                onClick={() => setIsForgotPasswordOpen(true)}
              >
                Esqueceu a senha?
              </Button>
            </div>

            <Button type="submit" className="w-full h-12 text-lg font-medium">
              Entrar
            </Button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-muted-foreground">Não tem conta? </span>
            <Link to="/register">
              <Button variant="link" className="text-primary p-0">
                Cadastre sua organização
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <ForgotPasswordModal 
        open={isForgotPasswordOpen}
        onOpenChange={setIsForgotPasswordOpen}
      />
    </div>
  );
};

export default Login;
