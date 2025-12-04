import { useAuth } from "@/contexts/AuthContext";
import { useTickets, useTicketStats } from "@/hooks/useTickets";
import { Link } from "react-router-dom";
import { 
  Ticket, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp,
  Users,
  ArrowRight,
  Activity
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const priorityConfig: Record<string, { label: string; className: string }> = {
  critical: { label: "Critique", className: "bg-red-500/10 text-red-500 border-red-500/20" },
  high: { label: "Haute", className: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  medium: { label: "Moyenne", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  low: { label: "Basse", className: "bg-slate-500/10 text-slate-500 border-slate-500/20" }
};

const statusConfig: Record<string, { label: string; className: string }> = {
  new: { label: "Nouveau", className: "bg-blue-500/10 text-blue-500" },
  open: { label: "Ouvert", className: "bg-yellow-500/10 text-yellow-500" },
  in_progress: { label: "En cours", className: "bg-orange-500/10 text-orange-500" },
  pending: { label: "En attente", className: "bg-purple-500/10 text-purple-500" },
  resolved: { label: "Résolu", className: "bg-green-500/10 text-green-500" },
  closed: { label: "Fermé", className: "bg-muted text-muted-foreground" }
};

export default function TechnicianHome() {
  const { profile, user, isAdmin } = useAuth();
  const { data: tickets, isLoading } = useTickets();
  const { data: stats } = useTicketStats();

  // Tickets assigned to current user
  const myAssignedTickets = tickets?.filter(t => t.assigned_to === user?.id) || [];
  const myOpenTickets = myAssignedTickets.filter(t => 
    ['new', 'open', 'in_progress', 'pending'].includes(t.status)
  );

  // Unassigned tickets (for pickup)
  const unassignedTickets = tickets?.filter(t => 
    !t.assigned_to && ['new', 'open'].includes(t.status)
  ) || [];

  // High priority tickets
  const highPriorityTickets = tickets?.filter(t => 
    ['critical', 'high'].includes(t.priority) && 
    ['new', 'open', 'in_progress'].includes(t.status)
  ) || [];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  // Calculate SLA compliance (simplified)
  const slaCompliance = stats?.total ? Math.round(((stats.total - (stats.byStatus.pending || 0)) / stats.total) * 100) : 100;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'Technicien'} 👋
          </h1>
          <p className="text-muted-foreground">
            Voici un aperçu de votre activité
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/tickets">
              Voir tous les tickets
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mes tickets ouverts
            </CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myOpenTickets.length}</div>
            <p className="text-xs text-muted-foreground">
              {myAssignedTickets.length} au total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Non assignés
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{unassignedTickets.length}</div>
            <p className="text-xs text-muted-foreground">
              À prendre en charge
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Priorité haute/critique
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{highPriorityTickets.length}</div>
            <p className="text-xs text-muted-foreground">
              Requièrent attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conformité SLA
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{slaCompliance}%</div>
            <Progress value={slaCompliance} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* My Open Tickets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Mes tickets en cours</CardTitle>
              <CardDescription>Tickets qui vous sont assignés</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/tickets?assigned=me" className="flex items-center gap-1">
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {myOpenTickets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucun ticket en cours</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myOpenTickets.slice(0, 5).map((ticket) => (
                  <Link
                    key={ticket.id}
                    to={`/tickets/${ticket.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-muted-foreground">
                          #{ticket.ticket_number}
                        </span>
                        <Badge variant="outline" className={priorityConfig[ticket.priority]?.className}>
                          {priorityConfig[ticket.priority]?.label}
                        </Badge>
                      </div>
                      <p className="font-medium truncate">{ticket.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true, locale: fr })}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Unassigned Tickets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Tickets non assignés</CardTitle>
              <CardDescription>À prendre en charge</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/tickets?assigned=none" className="flex items-center gap-1">
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {unassignedTickets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Tous les tickets sont assignés</p>
              </div>
            ) : (
              <div className="space-y-3">
                {unassignedTickets.slice(0, 5).map((ticket) => (
                  <Link
                    key={ticket.id}
                    to={`/tickets/${ticket.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-muted-foreground">
                          #{ticket.ticket_number}
                        </span>
                        <Badge variant="outline" className={priorityConfig[ticket.priority]?.className}>
                          {priorityConfig[ticket.priority]?.label}
                        </Badge>
                        <Badge variant="outline" className={statusConfig[ticket.status]?.className}>
                          {statusConfig[ticket.status]?.label}
                        </Badge>
                      </div>
                      <p className="font-medium truncate">{ticket.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={ticket.requester?.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {ticket.requester?.full_name?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {ticket.requester?.full_name || 'Utilisateur'}
                        </span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Prendre
                    </Button>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* High Priority Section */}
      {highPriorityTickets.length > 0 && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-5 w-5" />
              Tickets prioritaires
            </CardTitle>
            <CardDescription>Ces tickets nécessitent une attention immédiate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {highPriorityTickets.slice(0, 6).map((ticket) => (
                <Link
                  key={ticket.id}
                  to={`/tickets/${ticket.id}`}
                  className="p-3 rounded-lg border border-red-500/20 bg-background hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className={priorityConfig[ticket.priority]?.className}>
                      {priorityConfig[ticket.priority]?.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      #{ticket.ticket_number}
                    </span>
                  </div>
                  <p className="font-medium text-sm truncate">{ticket.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {ticket.assignee?.full_name || 'Non assigné'}
                  </p>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
