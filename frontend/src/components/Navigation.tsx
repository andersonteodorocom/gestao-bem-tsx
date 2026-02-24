import { Link, useLocation, useNavigate } from "react-router-dom";
import { Users, ClipboardList, Calendar, BarChart3, LogOut, Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import logoIcon from "@/assets/logo-icon.png";
import UserProfileModal from "@/components/modals/UserProfileModal";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { path: "/volunteers", label: "Voluntários", icon: Users },
    { path: "/tasks", label: "Tarefas", icon: ClipboardList },
    { path: "/events", label: "Eventos", icon: Calendar },
  ];

  const isActive = (path: string) => location.pathname === path;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    // Aqui você pode adicionar lógica de logout (limpar tokens, etc.)
    closeMobileMenu();
    navigate("/login");
  };

  const openProfileModal = () => {
    setIsProfileModalOpen(true);
    closeMobileMenu();
  };

  return (
    <nav className="bg-background border-b border-border px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/dashboard" className="flex items-center" onClick={closeMobileMenu}>
            <img src={logoIcon} alt="Gestão do Bem" className="h-16 w-16" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Desktop User Actions */}
        <div className="hidden md:flex items-center gap-2">
          <Button 
            variant="ghost" 
            className="flex items-center gap-2"
            onClick={openProfileModal}
          >
            <User className="h-4 w-4" />
            Perfil
          </Button>
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 text-destructive hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMobileMenu}
            className="p-2"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-4 py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path} onClick={closeMobileMenu} className="block">
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    className="w-full justify-start gap-3 h-12"
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
            <div className="pt-2 border-t border-border space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 h-12"
                onClick={openProfileModal}
              >
                <User className="h-5 w-5" />
                Perfil
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      <UserProfileModal 
        open={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
      />
    </nav>
  );
};

export default Navigation;