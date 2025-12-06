import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Ticket,
  FolderOpen,
  BookOpen,
  Monitor,
  Settings,
  Users,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  LogOut,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { InterfaceSwitch } from "./InterfaceSwitch";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, isAdmin, isITStaff, signOut } = useAuth();

  // Build navigation items - simplified menu with single Tickets entry
  const getMainNavItems = (): NavItem[] => {
    const items: NavItem[] = [
      { title: "Tableau de bord", url: "/", icon: LayoutDashboard },
      { title: "Tickets", url: "/tickets", icon: Ticket, badge: 12 },
      { title: "Catalogue", url: "/catalog", icon: FolderOpen },
      { title: "Connaissances", url: "/knowledge", icon: BookOpen },
    ];

    if (isITStaff) {
      items.push({ title: "Inventaire", url: "/inventory", icon: Monitor });
    }

    return items;
  };

  const getAdminNavItems = (): NavItem[] => {
    if (!isAdmin) return [];
    
    return [
      { title: "Utilisateurs", url: "/users", icon: Users },
      { title: "Paramètres", url: "/settings", icon: Settings },
    ];
  };

  const mainNavItems = getMainNavItems();
  const adminNavItems = getAdminNavItems();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const NavItemComponent = ({ item }: { item: NavItem }) => {
    const isActive = location.pathname === item.url || 
      (item.url !== "/" && location.pathname.startsWith(item.url.split('?')[0]));
    
    const content = (
      <NavLink
        to={item.url}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
          isActive
            ? "bg-primary text-primary-foreground shadow-md"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        )}
      >
        <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary-foreground")} />
        {!collapsed && (
          <>
            <span className="font-medium">{item.title}</span>
            {item.badge && (
              <span className={cn(
                "ml-auto px-2 py-0.5 text-xs rounded-full",
                isActive 
                  ? "bg-primary-foreground/20 text-primary-foreground" 
                  : "bg-primary/20 text-primary"
              )}>
                {item.badge}
              </span>
            )}
          </>
        )}
        {collapsed && item.badge && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
            {item.badge > 9 ? "9+" : item.badge}
          </span>
        )}
      </NavLink>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            {item.title}
            {item.badge && (
              <span className="bg-primary/20 text-primary px-2 py-0.5 text-xs rounded-full">
                {item.badge}
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  // Get user initials
  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  // Get role display name
  const getRoleDisplay = () => {
    if (isAdmin) return "Administrateur";
    if (isITStaff) return "Technicien IT";
    return "Utilisateur";
  };

  return (
    <aside
      className={cn(
        "h-screen flex flex-col border-r border-sidebar-border transition-all duration-300 ease-in-out",
        "bg-gradient-to-b from-sidebar to-sidebar/95",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center h-16 border-b border-sidebar-border px-4",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg gradient-text">ITSM Pro</span>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Interface Switch */}
      <div className={cn("p-3 border-b border-sidebar-border", collapsed && "px-2")}>
        <InterfaceSwitch collapsed={collapsed} />
      </div>

      {/* Quick Actions */}
      <div className={cn("p-3 border-b border-sidebar-border", collapsed && "px-2")}>
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button variant="gradient" size="icon" className="w-full" onClick={() => navigate('/tickets/new')}>
                <Plus className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Nouveau ticket</TooltipContent>
          </Tooltip>
        ) : (
          <Button variant="gradient" className="w-full justify-start gap-2" onClick={() => navigate('/tickets/new')}>
            <Plus className="h-4 w-4" />
            Nouveau ticket
          </Button>
        )}
      </div>

      {/* Search (only when expanded) */}
      {!collapsed && (
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 text-muted-foreground text-sm">
            <Search className="h-4 w-4" />
            <span>Rechercher...</span>
            <kbd className="ml-auto px-1.5 py-0.5 text-xs bg-muted rounded">⌘K</kbd>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Principal
            </p>
          )}
          {mainNavItems.map((item) => (
            <NavItemComponent key={item.url} item={item} />
          ))}
        </div>

        {adminNavItems.length > 0 && (
          <div className="pt-4 space-y-1">
            {!collapsed && (
              <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Administration
              </p>
            )}
            {adminNavItems.map((item) => (
              <NavItemComponent key={item.url} item={item} />
            ))}
          </div>
        )}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-sidebar-border">
        <div className={cn(
          "flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors",
          collapsed && "justify-center"
        )}>
          <Avatar className="h-9 w-9">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback>{getInitials(profile?.full_name)}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile?.full_name || 'Utilisateur'}</p>
              <p className="text-xs text-muted-foreground truncate">{getRoleDisplay()}</p>
            </div>
          )}
        </div>
        
        {/* Sign Out Button */}
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-full mt-2 text-muted-foreground hover:text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Déconnexion</TooltipContent>
          </Tooltip>
        ) : (
          <Button 
            variant="ghost" 
            className="w-full mt-2 justify-start text-muted-foreground hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        )}
      </div>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          className={cn("w-full", !collapsed && "justify-start")}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Réduire</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
