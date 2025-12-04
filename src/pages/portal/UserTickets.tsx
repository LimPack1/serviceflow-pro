import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTickets } from "@/hooks/useTickets";
import { 
  PlusCircle, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  Search,
  Filter,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const statusConfig: Record<string, { label: string; icon: typeof Clock; className: string }> = {
  new: { label: "Nouveau", icon: AlertCircle, className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  open: { label: "Ouvert", icon: Clock, className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  in_progress: { label: "En cours", icon: Clock, className: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  pending: { label: "En attente", icon: Clock, className: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  resolved: { label: "Résolu", icon: CheckCircle, className: "bg-green-500/10 text-green-500 border-green-500/20" },
  closed: { label: "Fermé", icon: CheckCircle, className: "bg-muted text-muted-foreground border-border" }
};

const priorityConfig: Record<string, { label: string; className: string }> = {
  low: { label: "Basse", className: "bg-slate-500/10 text-slate-500" },
  medium: { label: "Moyenne", className: "bg-blue-500/10 text-blue-500" },
  high: { label: "Haute", className: "bg-orange-500/10 text-orange-500" },
  critical: { label: "Critique", className: "bg-red-500/10 text-red-500" }
};

export default function UserTickets() {
  const { user } = useAuth();
  const { data: tickets, isLoading } = useTickets();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Filter user's own tickets
  const myTickets = tickets?.filter(t => t.requester_id === user?.id) || [];
  
  const filteredTickets = myTickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(search.toLowerCase()) ||
      ticket.ticket_number.toString().includes(search);
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openCount = myTickets.filter(t => ['new', 'open', 'in_progress', 'pending'].includes(t.status)).length;
  const resolvedCount = myTickets.filter(t => ['resolved', 'closed'].includes(t.status)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mes tickets</h1>
          <p className="text-muted-foreground">Suivez l'état de vos demandes</p>
        </div>
        <Button asChild>
          <Link to="/portal/tickets/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            Nouveau ticket
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{myTickets.length}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{openCount}</p>
            <p className="text-sm text-muted-foreground">En cours</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{resolvedCount}</p>
            <p className="text-sm text-muted-foreground">Résolus</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre ou numéro..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="new">Nouveau</SelectItem>
                <SelectItem value="open">Ouvert</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="resolved">Résolu</SelectItem>
                <SelectItem value="closed">Fermé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des tickets</CardTitle>
          <CardDescription>{filteredTickets.length} ticket(s) trouvé(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Aucun ticket trouvé</p>
              <p className="text-sm">Modifiez vos filtres ou créez un nouveau ticket</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTickets.map((ticket) => {
                const status = statusConfig[ticket.status] || statusConfig.new;
                const priority = priorityConfig[ticket.priority] || priorityConfig.medium;
                return (
                  <Link
                    key={ticket.id}
                    to={`/portal/tickets/${ticket.id}`}
                    className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-muted-foreground">
                            #{ticket.ticket_number}
                          </span>
                          <Badge variant="outline" className={status.className}>
                            {status.label}
                          </Badge>
                          <Badge variant="outline" className={priority.className}>
                            {priority.label}
                          </Badge>
                        </div>
                        <h3 className="font-medium truncate">{ticket.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Créé {formatDistanceToNow(new Date(ticket.created_at), { 
                            addSuffix: true, 
                            locale: fr 
                          })}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
