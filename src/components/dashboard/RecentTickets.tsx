import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTickets } from "@/hooks/useTickets";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const statusLabels: Record<string, string> = {
  new: "Nouveau",
  open: "Ouvert",
  in_progress: "En cours",
  pending: "En attente",
  resolved: "Résolu",
  closed: "Fermé",
};

const typeLabels: Record<string, string> = {
  incident: "Incident",
  request: "Demande",
  problem: "Problème",
  change: "Changement",
};

const priorityLabels: Record<string, string> = {
  critical: "Critique",
  high: "Haute",
  medium: "Moyenne",
  low: "Basse",
};

export function RecentTickets() {
  const { data: tickets, isLoading } = useTickets();
  const recentTickets = tickets?.slice(0, 5) || [];

  if (isLoading) {
    return (
      <div className="glass-card rounded-xl border border-border animate-fade-in">
        <div className="p-6 border-b border-border">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60 mt-2" />
        </div>
        <div className="divide-y divide-border">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recentTickets.length === 0) {
    return (
      <div className="glass-card rounded-xl border border-border animate-fade-in p-12 text-center">
        <p className="text-muted-foreground">Aucun ticket pour le moment</p>
        <Button variant="gradient" className="mt-4" asChild>
          <Link to="/tickets/new">Créer un ticket</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl border border-border animate-fade-in">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Tickets récents</h3>
            <p className="text-sm text-muted-foreground">
              Les derniers tickets créés
            </p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/tickets" className="gap-1">
              Voir tous
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
      <div className="divide-y divide-border">
        {recentTickets.map((ticket) => (
          <Link
            key={ticket.id}
            to={`/tickets/${ticket.id}`}
            className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={ticket.requester?.avatar_url || undefined} />
              <AvatarFallback>
                {ticket.requester?.full_name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("") || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-muted-foreground">
                  TKT-{ticket.ticket_number}
                </span>
                <Badge variant={ticket.type as any}>{typeLabels[ticket.type]}</Badge>
              </div>
              <p className="text-sm font-medium truncate">{ticket.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true, locale: fr })}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant={`status-${ticket.status.replace('_', '-')}` as any}>
                {statusLabels[ticket.status]}
              </Badge>
              <Badge variant={`priority-${ticket.priority}` as any}>
                {priorityLabels[ticket.priority]}
              </Badge>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
