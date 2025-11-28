import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface RecentTicket {
  id: string;
  number: string;
  title: string;
  status: "new" | "open" | "pending" | "resolved" | "closed";
  priority: "critical" | "high" | "medium" | "low";
  type: "incident" | "request" | "problem" | "change";
  requester: {
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

const recentTickets: RecentTicket[] = [
  {
    id: "1",
    number: "TKT-2024-0042",
    title: "Impossible de se connecter au VPN depuis ce matin",
    status: "new",
    priority: "high",
    type: "incident",
    requester: { name: "Marie Martin" },
    createdAt: "Il y a 5 min",
  },
  {
    id: "2",
    number: "TKT-2024-0041",
    title: "Demande d'installation Adobe Creative Suite",
    status: "open",
    priority: "medium",
    type: "request",
    requester: { name: "Pierre Durand" },
    createdAt: "Il y a 30 min",
  },
  {
    id: "3",
    number: "TKT-2024-0040",
    title: "Écran bleu récurrent sur poste de travail",
    status: "pending",
    priority: "critical",
    type: "incident",
    requester: { name: "Sophie Bernard" },
    createdAt: "Il y a 2h",
  },
  {
    id: "4",
    number: "TKT-2024-0039",
    title: "Mise à jour des droits d'accès serveur",
    status: "open",
    priority: "low",
    type: "change",
    requester: { name: "Lucas Petit" },
    createdAt: "Il y a 3h",
  },
  {
    id: "5",
    number: "TKT-2024-0038",
    title: "Problème d'impression sur imprimante RDC",
    status: "resolved",
    priority: "medium",
    type: "incident",
    requester: { name: "Emma Roux" },
    createdAt: "Il y a 5h",
  },
];

const statusLabels = {
  new: "Nouveau",
  open: "Ouvert",
  pending: "En attente",
  resolved: "Résolu",
  closed: "Fermé",
};

const typeLabels = {
  incident: "Incident",
  request: "Demande",
  problem: "Problème",
  change: "Changement",
};

export function RecentTickets() {
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
              <AvatarImage src={ticket.requester.avatar} />
              <AvatarFallback>
                {ticket.requester.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-muted-foreground">
                  {ticket.number}
                </span>
                <Badge variant={ticket.type}>{typeLabels[ticket.type]}</Badge>
              </div>
              <p className="text-sm font-medium truncate">{ticket.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {ticket.createdAt}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant={`status-${ticket.status}`}>
                {statusLabels[ticket.status]}
              </Badge>
              <Badge variant={`priority-${ticket.priority}`}>
                {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
              </Badge>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
