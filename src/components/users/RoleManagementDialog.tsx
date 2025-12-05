import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, User, Wrench, UserCog } from "lucide-react";
import { useAddUserRole, useRemoveUserRole } from "@/hooks/useUserManagement";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database['public']['Enums']['app_role'];

interface UserWithRoles {
  id: string;
  email: string;
  full_name: string | null;
  roles: { role: AppRole }[];
}

interface RoleManagementDialogProps {
  user: UserWithRoles | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const roleConfig: Record<AppRole, { label: string; description: string; icon: React.ReactNode; variant: string }> = {
  admin: {
    label: "Administrateur",
    description: "Accès complet au système, gestion des utilisateurs et paramètres",
    icon: <Shield className="h-4 w-4" />,
    variant: "destructive"
  },
  manager: {
    label: "Technicien",
    description: "Gestion des tickets, inventaire, base de connaissances",
    icon: <Wrench className="h-4 w-4" />,
    variant: "warning"
  },
  agent: {
    label: "Agent",
    description: "Création et suivi des tickets pour les utilisateurs",
    icon: <UserCog className="h-4 w-4" />,
    variant: "default"
  },
  user: {
    label: "Utilisateur",
    description: "Accès au portail utilisateur uniquement",
    icon: <User className="h-4 w-4" />,
    variant: "secondary"
  }
};

const allRoles: AppRole[] = ['admin', 'manager', 'agent', 'user'];

export function RoleManagementDialog({ user, open, onOpenChange }: RoleManagementDialogProps) {
  const addRole = useAddUserRole();
  const removeRole = useRemoveUserRole();
  const [pendingChanges, setPendingChanges] = useState<Set<AppRole>>(new Set());

  if (!user) return null;

  const currentRoles = new Set(user.roles.map(r => r.role));
  const isLoading = addRole.isPending || removeRole.isPending;

  const handleRoleToggle = async (role: AppRole) => {
    if (isLoading) return;
    
    setPendingChanges(prev => new Set(prev).add(role));
    
    try {
      if (currentRoles.has(role)) {
        await removeRole.mutateAsync({ userId: user.id, role });
      } else {
        await addRole.mutateAsync({ userId: user.id, role });
      }
    } finally {
      setPendingChanges(prev => {
        const next = new Set(prev);
        next.delete(role);
        return next;
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gérer les rôles</DialogTitle>
          <DialogDescription>
            Modifiez les rôles de {user.full_name || user.email}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {allRoles.map((role) => {
            const config = roleConfig[role];
            const hasRole = currentRoles.has(role);
            const isPending = pendingChanges.has(role);

            return (
              <div
                key={role}
                className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  id={role}
                  checked={hasRole}
                  disabled={isPending}
                  onCheckedChange={() => handleRoleToggle(role)}
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor={role}
                      className="font-medium cursor-pointer flex items-center gap-2"
                    >
                      {config.icon}
                      {config.label}
                    </Label>
                    {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {config.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 py-2 border-t">
          <span className="text-sm text-muted-foreground">Rôles actuels:</span>
          <div className="flex flex-wrap gap-1">
            {user.roles.length === 0 ? (
              <Badge variant="outline">Aucun rôle</Badge>
            ) : (
              user.roles.map(({ role }) => (
                <Badge key={role} variant={roleConfig[role].variant as any}>
                  {roleConfig[role].label}
                </Badge>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
