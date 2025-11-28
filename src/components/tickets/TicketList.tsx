import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  Filter,
  SlidersHorizontal,
  Plus,
  MoreHorizontal,
  Clock,
  AlertTriangle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Ticket {
  id: string;
  number: string;
  title: string;
  status: "new" | "open" | "pending" | "resolved" | "closed";
  priority: "critical" | "high" | "medium" | "low";
  type: "incident" | "request" | "problem" | "change";
  category: string;
  requester: {
    name: string;
    avatar?: string;
  };
  assignee?: {
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  slaBreached: boolean;
}

const mockTickets: Ticket[] = [
  {
    id: "1",
    number: "TKT-2024-0042",
    title: "Impossible de se connecter au VPN depuis ce matin",
    status: "new",
    priority: "high",
    type: "incident",
    category: "Réseau",
    requester: { name: "Marie Martin" },
    createdAt: "2024-01-15 09:30",
    updatedAt: "2024-01-15 09:30",
    slaBreached: false,
  },
  {
    id: "2",
    number: "TKT-2024-0041",
    title: "Demande d'installation Adobe Creative Suite",
    status: "open",
    priority: "medium",
    type: "request",
    category: "Logiciels",
    requester: { name: "Pierre Durand" },
    assignee: { name: "Jean Dupont" },
    createdAt: "2024-01-15 08:45",
    updatedAt: "2024-01-15 10:15",
    slaBreached: false,
  },
  {
    id: "3",
    number: "TKT-2024-0040",
    title: "Écran bleu récurrent sur poste de travail",
    status: "pending",
    priority: "critical",
    type: "incident",
    category: "Matériel",
    requester: { name: "Sophie Bernard" },
    assignee: { name: "Jean Dupont" },
    createdAt: "2024-01-15 07:00",
    updatedAt: "2024-01-15 11:30",
    slaBreached: true,
  },
  {
    id: "4",
    number: "TKT-2024-0039",
    title: "Mise à jour des droits d'accès serveur de production",
    status: "open",
    priority: "low",
    type: "change",
    category: "Accès",
    requester: { name: "Lucas Petit" },
    assignee: { name: "Alice Moreau" },
    createdAt: "2024-01-14 16:30",
    updatedAt: "2024-01-15 09:00",
    slaBreached: false,
  },
  {
    id: "5",
    number: "TKT-2024-0038",
    title: "Problème d'impression sur imprimante RDC",
    status: "resolved",
    priority: "medium",
    type: "incident",
    category: "Matériel",
    requester: { name: "Emma Roux" },
    assignee: { name: "Jean Dupont" },
    createdAt: "2024-01-14 14:00",
    updatedAt: "2024-01-15 08:30",
    slaBreached: false,
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

const priorityLabels = {
  critical: "Critique",
  high: "Haute",
  medium: "Moyenne",
  low: "Basse",
};

export function TicketList() {
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredTickets = mockTickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesType = typeFilter === "all" || ticket.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const toggleSelectAll = () => {
    if (selectedTickets.length === filteredTickets.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(filteredTickets.map((t) => t.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedTickets((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un ticket..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="new">Nouveau</SelectItem>
              <SelectItem value="open">Ouvert</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="resolved">Résolu</SelectItem>
              <SelectItem value="closed">Fermé</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="incident">Incident</SelectItem>
              <SelectItem value="request">Demande</SelectItem>
              <SelectItem value="problem">Problème</SelectItem>
              <SelectItem value="change">Changement</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="gradient" asChild>
          <Link to="/tickets/new">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau ticket
          </Link>
        </Button>
      </div>

      {/* Selected Actions */}
      {selectedTickets.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
          <span className="text-sm font-medium">
            {selectedTickets.length} ticket(s) sélectionné(s)
          </span>
          <Button variant="secondary" size="sm">
            Assigner
          </Button>
          <Button variant="secondary" size="sm">
            Changer le statut
          </Button>
          <Button variant="destructive" size="sm">
            Supprimer
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="glass-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedTickets.length === filteredTickets.length}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="w-32">Numéro</TableHead>
              <TableHead>Titre</TableHead>
              <TableHead className="w-28">Statut</TableHead>
              <TableHead className="w-24">Priorité</TableHead>
              <TableHead className="w-28">Type</TableHead>
              <TableHead className="w-36">Assigné à</TableHead>
              <TableHead className="w-36">Créé le</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.map((ticket) => (
              <TableRow
                key={ticket.id}
                className="group cursor-pointer"
                onClick={() => {}}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedTickets.includes(ticket.id)}
                    onCheckedChange={() => toggleSelect(ticket.id)}
                  />
                </TableCell>
                <TableCell>
                  <Link
                    to={`/tickets/${ticket.id}`}
                    className="font-mono text-sm text-primary hover:underline"
                  >
                    {ticket.number}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {ticket.slaBreached && (
                      <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                    )}
                    <span className="truncate max-w-[300px]">{ticket.title}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={`status-${ticket.status}`}>
                    {statusLabels[ticket.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={`priority-${ticket.priority}`}>
                    {priorityLabels[ticket.priority]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={ticket.type}>{typeLabels[ticket.type]}</Badge>
                </TableCell>
                <TableCell>
                  {ticket.assignee ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={ticket.assignee.avatar} />
                        <AvatarFallback className="text-xs">
                          {ticket.assignee.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{ticket.assignee.name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Non assigné</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {ticket.createdAt}
                  </div>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
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
                      <DropdownMenuItem>Voir détails</DropdownMenuItem>
                      <DropdownMenuItem>Assigner</DropdownMenuItem>
                      <DropdownMenuItem>Changer le statut</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Supprimer
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
  );
}
