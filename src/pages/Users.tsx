import { useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Search, MoreHorizontal, Shield, Loader2, RefreshCw, UserCog } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUsersWithRoles } from "@/hooks/useUserManagement";
import { RoleManagementDialog } from "@/components/users/RoleManagementDialog";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database['public']['Enums']['app_role'];

const roleColors: Record<AppRole, string> = {
  admin: "destructive",
  manager: "warning",
  agent: "default",
  user: "secondary",
};

const roleLabels: Record<AppRole, string> = {
  admin: "Administrateur",
  manager: "Technicien",
  agent: "Agent",
  user: "Utilisateur",
};

export default function Users() {
  const { data: users, isLoading, error, refetch } = useUsersWithRoles();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<typeof users extends (infer U)[] ? U : never | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);

  // Filter users based on search
  const filteredUsers = users?.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.department?.toLowerCase().includes(query)
    );
  });

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return email[0].toUpperCase();
  };

  const handleManageRoles = (user: NonNullable<typeof users>[number]) => {
    setSelectedUser(user);
    setRoleDialogOpen(true);
  };

  if (error) {
    return (
      <div className="min-h-screen">
        <AppHeader
          title="Gestion des utilisateurs"
          subtitle="Utilisateurs synchronisés depuis Entra ID"
        />
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-destructive">Erreur lors du chargement des utilisateurs</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader
        title="Gestion des utilisateurs"
        subtitle="Utilisateurs synchronisés depuis Entra ID"
      />
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Info Banner */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/10 border border-primary/20">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <p className="font-medium">Synchronisation Entra ID active</p>
            <p className="text-sm text-muted-foreground">
              Les utilisateurs sont automatiquement synchronisés depuis Azure Active Directory.
              Dernière sync: il y a 5 minutes
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher un utilisateur..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="gradient" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Synchroniser
          </Button>
        </div>

        {/* Table */}
        <div className="glass-card rounded-xl border border-border overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Rôle(s)</TableHead>
                  <TableHead>Département</TableHead>
                  <TableHead>Poste</TableHead>
                  <TableHead>Entra ID</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers?.map((user) => (
                    <TableRow key={user.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback>
                              {getInitials(user.full_name, user.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.full_name || 'Sans nom'}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.length === 0 ? (
                            <Badge variant="outline">Aucun rôle</Badge>
                          ) : (
                            user.roles.map(({ role }) => (
                              <Badge key={role} variant={roleColors[role] as any}>
                                {roleLabels[role]}
                              </Badge>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{user.department || '-'}</TableCell>
                      <TableCell>{user.job_title || '-'}</TableCell>
                      <TableCell>
                        {user.entra_id ? (
                          <Badge variant="status-resolved">Lié</Badge>
                        ) : (
                          <Badge variant="outline">Non lié</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="opacity-0 group-hover:opacity-100"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleManageRoles(user)}>
                              <UserCog className="h-4 w-4 mr-2" />
                              Gérer les rôles
                            </DropdownMenuItem>
                            <DropdownMenuItem>Voir les tickets</DropdownMenuItem>
                            <DropdownMenuItem>Voir les équipements</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <RoleManagementDialog 
        user={selectedUser}
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
      />
    </div>
  );
}
