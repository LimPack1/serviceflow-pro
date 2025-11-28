import { AppHeader } from "@/components/layout/AppHeader";
import { Users as UsersIcon, Search, Plus, MoreHorizontal, Shield } from "lucide-react";
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

const users = [
  {
    id: "1",
    name: "Jean Dupont",
    email: "jean.dupont@company.com",
    role: "Agent IT",
    department: "IT",
    status: "active",
    lastActive: "En ligne",
  },
  {
    id: "2",
    name: "Marie Martin",
    email: "marie.martin@company.com",
    role: "Utilisateur",
    department: "Comptabilité",
    status: "active",
    lastActive: "Il y a 5 min",
  },
  {
    id: "3",
    name: "Pierre Durand",
    email: "pierre.durand@company.com",
    role: "Utilisateur",
    department: "Développement",
    status: "active",
    lastActive: "Il y a 1h",
  },
  {
    id: "4",
    name: "Sophie Bernard",
    email: "sophie.bernard@company.com",
    role: "Manager",
    department: "RH",
    status: "active",
    lastActive: "Il y a 2h",
  },
  {
    id: "5",
    name: "Alice Moreau",
    email: "alice.moreau@company.com",
    role: "Admin",
    department: "IT",
    status: "active",
    lastActive: "En ligne",
  },
];

const roleColors = {
  Admin: "destructive",
  "Agent IT": "default",
  Manager: "warning",
  Utilisateur: "secondary",
} as const;

export default function Users() {
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
            <Input placeholder="Rechercher un utilisateur..." className="pl-10" />
          </div>
          <Button variant="gradient">
            <Plus className="h-4 w-4 mr-2" />
            Forcer la synchronisation
          </Button>
        </div>

        {/* Table */}
        <div className="glass-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Utilisateur</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Département</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Dernière activité</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage />
                        <AvatarFallback>
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleColors[user.role as keyof typeof roleColors]}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>
                    <Badge variant="status-resolved">Actif</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {user.lastActive}
                    </span>
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
                        <DropdownMenuItem>Voir profil</DropdownMenuItem>
                        <DropdownMenuItem>Modifier les droits</DropdownMenuItem>
                        <DropdownMenuItem>Voir les tickets</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Désactiver
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
