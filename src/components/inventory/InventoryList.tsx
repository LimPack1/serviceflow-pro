import { useState } from "react";
import {
  Monitor,
  Laptop,
  Smartphone,
  Server,
  Printer,
  Wifi,
  Search,
  Plus,
  MoreHorizontal,
  AlertTriangle,
  Package,
  UserPlus,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAssets, useAssetStats } from "@/hooks/useAssets";
import { Skeleton } from "@/components/ui/skeleton";
import { AssetAssignDialog } from "./AssetAssignDialog";

const typeIcons: Record<string, any> = {
  desktop: Monitor,
  laptop: Laptop,
  smartphone: Smartphone,
  tablet: Smartphone,
  server: Server,
  printer: Printer,
  network: Wifi,
  other: Package,
};

const typeLabels: Record<string, string> = {
  desktop: "Ordinateur",
  laptop: "Portable",
  smartphone: "Smartphone",
  tablet: "Tablette",
  server: "Serveur",
  printer: "Imprimante",
  network: "Réseau",
  other: "Autre",
};

const statusLabels: Record<string, string> = {
  active: "Actif",
  maintenance: "Maintenance",
  retired: "Retiré",
  lost: "Perdu",
};

const statusVariants: Record<string, string> = {
  active: "status-resolved",
  maintenance: "status-pending",
  retired: "status-closed",
  lost: "destructive",
};

export function InventoryList() {
  const { data: assets, isLoading } = useAssets();
  const { data: stats } = useAssetStats();
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedAssetForAssign, setSelectedAssetForAssign] = useState<{
    id: string;
    name: string;
    assigned_user?: {
      id: string;
      full_name: string | null;
      email: string;
      avatar_url: string | null;
    } | null;
  } | null>(null);

  const filteredAssets = (assets || []).filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.asset_tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.serial_number?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
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

  const isWarrantyExpiringSoon = (date?: string | null) => {
    if (!date) return false;
    const expiry = new Date(date);
    const today = new Date();
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 90 && daysUntilExpiry > 0;
  };

  const handleOpenAssignDialog = (asset: typeof selectedAssetForAssign) => {
    setSelectedAssetForAssign(asset);
    setAssignDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(typeLabels).slice(0, 4).map(([type, label]) => {
          const count = stats?.byType?.[type] || 0;
          const Icon = typeIcons[type] || Package;
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

      {/* Empty State */}
      {filteredAssets.length === 0 && (
        <div className="glass-card rounded-xl border border-border p-12 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Aucun équipement trouvé</p>
        </div>
      )}

      {/* Table */}
      {filteredAssets.length > 0 && (
        <div className="glass-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedAssets.length === filteredAssets.length && filteredAssets.length > 0}
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
                const Icon = typeIcons[asset.type] || Package;
                const warrantyWarning = isWarrantyExpiringSoon(asset.warranty_expires);

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
                      <Badge variant="outline">{typeLabels[asset.type] || asset.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{asset.serial_number || asset.asset_tag}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariants[asset.status] as any}>
                        {statusLabels[asset.status] || asset.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {asset.assigned_user ? (
                        <button
                          onClick={() => handleOpenAssignDialog({
                            id: asset.id,
                            name: asset.name,
                            assigned_user: asset.assigned_user
                          })}
                          className="flex items-center gap-2 hover:bg-secondary/50 rounded-lg p-1 -m-1 transition-colors"
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={asset.assigned_user.avatar_url || undefined} />
                            <AvatarFallback className="text-xs">
                              {asset.assigned_user.full_name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("") || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{asset.assigned_user.full_name}</span>
                        </button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground"
                          onClick={() => handleOpenAssignDialog({
                            id: asset.id,
                            name: asset.name,
                            assigned_user: null
                          })}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Assigner
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{asset.location || "-"}</span>
                    </TableCell>
                    <TableCell>
                      {asset.warranty_expires ? (
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
                            {asset.warranty_expires}
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
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleOpenAssignDialog({
                            id: asset.id,
                            name: asset.name,
                            assigned_user: asset.assigned_user
                          })}>
                            {asset.assigned_user ? "Changer propriétaire" : "Assigner à un utilisateur"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Historique</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Assign Dialog */}
      {selectedAssetForAssign && (
        <AssetAssignDialog
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          assetId={selectedAssetForAssign.id}
          assetName={selectedAssetForAssign.name}
          currentAssignee={selectedAssetForAssign.assigned_user}
        />
      )}
    </div>
  );
}
