/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiClient } from "@/services/api";
import logoFull from "@/assets/logo-full.png";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const [activityField, setActivityField] = useState("");

  const [adminFullName, setAdminFullName] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validações
    if (!email || !password || !confirmPassword || !organizationName || !adminFullName || !activityField) {
      setError("Todos os campos são obrigatórios");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor, insira um email válido");
      return;
    }

    const payload = {
      organizationName: organizationName,
      activityField: activityField,
      admin: {
        fullName: adminFullName,
        email: email,
        password: password,
      },
    };

    try {
      await apiClient.post("/organizations/register", payload);

      navigate("/login", {
        state: {
          message: "Cadastro realizado com sucesso! Faça login para continuar.",
        },
      });
    } catch (error: any) {
      setError(error.message);
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
              Cadastre sua organização e comece a gerenciar suas atividades
            </p>
          </div>

          {error && (
            <Alert className="mb-4" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Nome da organização"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                className="h-12 border-2 border-primary/30 focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0"
                required
              />
            </div>

            <div>
              <Input
                type="text"
                placeholder="Ramo de atividade (ex: Educação, Saúde)"
                value={activityField}
                onChange={(e) => setActivityField(e.target.value)}
                className="h-12 border-2 border-primary/30 focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0"
                required
              />
            </div>

            <hr />

            <div>
              <Input
                type="text"
                placeholder="Seu nome completo (administrador)"
                value={adminFullName}
                onChange={(e) => setAdminFullName(e.target.value)}
                className="h-12 border-2 border-primary/30 focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0"
                required
              />
            </div>

            <div>
              <Input
                type="email"
                placeholder="Seu email (será seu login)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 border-2 border-primary/30 focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0"
                required
              />
            </div>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Crie uma senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 border-2 border-primary/30 focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0 pr-12"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>

            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirme sua senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-12 border-2 border-primary/30 focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0 pr-12"
                required
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

            <Button type="submit" className="w-full h-12 text-lg font-medium">
              Cadastrar
            </Button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-muted-foreground">Já tem uma conta? </span>
            <Link to="/login">
              <Button variant="link" className="text-primary p-0">
                Fazer login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
