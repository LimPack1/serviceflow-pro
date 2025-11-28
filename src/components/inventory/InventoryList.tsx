import { useState } from "react";
import {
  Monitor,
  Laptop,
  Smartphone,
  Server,
  Printer,
  Wifi,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  AlertTriangle,
} from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Asset {
  id: string;
  name: string;
  type: "computer" | "laptop" | "smartphone" | "server" | "printer" | "network";
  serialNumber: string;
  model: string;
  manufacturer: string;
  status: "active" | "inactive" | "maintenance" | "retired";
  assignedTo?: {
    name: string;
    avatar?: string;
  };
  location: string;
  warrantyExpiry?: string;
  lastUpdated: string;
}

const mockAssets: Asset[] = [
  {
    id: "1",
    name: "PC-COMPTA-001",
    type: "computer",
    serialNumber: "SN-2024-001234",
    model: "OptiPlex 7090",
    manufacturer: "Dell",
    status: "active",
    assignedTo: { name: "Marie Martin" },
    location: "Bureau 201 - Comptabilité",
    warrantyExpiry: "2026-03-15",
    lastUpdated: "2024-01-10",
  },
  {
    id: "2",
    name: "LAPTOP-DEV-015",
    type: "laptop",
    serialNumber: "SN-2023-005678",
    model: "ThinkPad X1 Carbon",
    manufacturer: "Lenovo",
    status: "active",
    assignedTo: { name: "Pierre Durand" },
    location: "Bureau 305 - Développement",
    warrantyExpiry: "2025-06-20",
    lastUpdated: "2024-01-12",
  },
  {
    id: "3",
    name: "PHONE-COM-008",
    type: "smartphone",
    serialNumber: "SN-2024-009876",
    model: "iPhone 15 Pro",
    manufacturer: "Apple",
    status: "active",
    assignedTo: { name: "Sophie Bernard" },
    location: "Mobile",
    warrantyExpiry: "2025-09-01",
    lastUpdated: "2024-01-08",
  },
  {
    id: "4",
    name: "SRV-PROD-001",
    type: "server",
    serialNumber: "SN-2022-112233",
    model: "PowerEdge R750",
    manufacturer: "Dell",
    status: "active",
    location: "Salle serveur - Rack A",
    warrantyExpiry: "2024-02-28",
    lastUpdated: "2024-01-15",
  },
  {
    id: "5",
    name: "PRINT-RDC-001",
    type: "printer",
    serialNumber: "SN-2021-445566",
    model: "LaserJet Enterprise M507",
    manufacturer: "HP",
    status: "maintenance",
    location: "RDC - Accueil",
    lastUpdated: "2024-01-14",
  },
  {
    id: "6",
    name: "AP-WIFI-ETG1",
    type: "network",
    serialNumber: "SN-2023-778899",
    model: "UniFi U6 Pro",
    manufacturer: "Ubiquiti",
    status: "active",
    location: "Étage 1 - Couloir",
    warrantyExpiry: "2026-01-10",
    lastUpdated: "2024-01-11",
  },
];

const typeIcons = {
  computer: Monitor,
  laptop: Laptop,
  smartphone: Smartphone,
  server: Server,
  printer: Printer,
  network: Wifi,
};

const typeLabels = {
  computer: "Ordinateur",
  laptop: "Portable",
  smartphone: "Smartphone",
  server: "Serveur",
  printer: "Imprimante",
  network: "Réseau",
};

const statusLabels = {
  active: "Actif",
  inactive: "Inactif",
  maintenance: "Maintenance",
  retired: "Retiré",
};

const statusVariants = {
  active: "status-resolved",
  inactive: "status-closed",
  maintenance: "status-pending",
  retired: "status-closed",
} as const;

export function InventoryList() {
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredAssets = mockAssets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.model.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || asset.type === typeFilter;
    const matchesStatus = statusFilter === "all" || asset.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedAssets.length === filteredAssets.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(filteredAssets.map((a) => a.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedAssets((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const isWarrantyExpiringSoon = (date?: string) => {
    if (!date) return false;
    const expiry = new Date(date);
    const today = new Date();
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 90 && daysUntilExpiry > 0;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(typeLabels).map(([type, label]) => {
          const count = mockAssets.filter((a) => a.type === type).length;
          const Icon = typeIcons[type as keyof typeof typeIcons];
          return (
            <div
              key={type}
              className="glass-card rounded-xl p-4 border border-border"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">{label}s</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un équipement..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              {Object.entries(typeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {Object.entries(statusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="gradient">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un équipement
        </Button>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedAssets.length === filteredAssets.length}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Équipement</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>N° Série</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Assigné à</TableHead>
              <TableHead>Localisation</TableHead>
              <TableHead>Garantie</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssets.map((asset) => {
              const Icon = typeIcons[asset.type];
              const warrantyWarning = isWarrantyExpiringSoon(asset.warrantyExpiry);

              return (
                <TableRow key={asset.id} className="group">
                  <TableCell>
                    <Checkbox
                      checked={selectedAssets.includes(asset.id)}
                      onCheckedChange={() => toggleSelect(asset.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-secondary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{asset.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {asset.manufacturer} {asset.model}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{typeLabels[asset.type]}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">{asset.serialNumber}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[asset.status]}>
                      {statusLabels[asset.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {asset.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={asset.assignedTo.avatar} />
                          <AvatarFallback className="text-xs">
                            {asset.assignedTo.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{asset.assignedTo.name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Non assigné
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{asset.location}</span>
                  </TableCell>
                  <TableCell>
                    {asset.warrantyExpiry ? (
                      <div className="flex items-center gap-1">
                        {warrantyWarning && (
                          <AlertTriangle className="h-4 w-4 text-warning" />
                        )}
                        <span
                          className={cn(
                            "text-sm",
                            warrantyWarning && "text-warning"
                          )}
                        >
                          {asset.warrantyExpiry}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
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
                        <DropdownMenuItem>Voir détails</DropdownMenuItem>
                        <DropdownMenuItem>Modifier</DropdownMenuItem>
                        <DropdownMenuItem>Historique</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
