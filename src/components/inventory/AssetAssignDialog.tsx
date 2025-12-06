import { useState } from "react";
import { Search, User, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProfiles } from "@/hooks/useProfiles";
import { useUpdateAsset } from "@/hooks/useAssets";
import { toast } from "sonner";

interface AssetAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assetId: string;
  assetName: string;
  currentAssignee?: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  } | null;
}

export function AssetAssignDialog({
  open,
  onOpenChange,
  assetId,
  assetName,
  currentAssignee,
}: AssetAssignDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: profiles, isLoading } = useProfiles();
  const updateAsset = useUpdateAsset();

  const filteredProfiles = (profiles || []).filter((profile) => {
    const search = searchQuery.toLowerCase();
    return (
      profile.full_name?.toLowerCase().includes(search) ||
      profile.email.toLowerCase().includes(search) ||
      profile.department?.toLowerCase().includes(search)
    );
  });

  const handleAssign = async (userId: string) => {
    try {
      await updateAsset.mutateAsync({
        id: assetId,
        assigned_to: userId,
      });
      toast.success("Équipement assigné avec succès");
      onOpenChange(false);
    } catch (error) {
      toast.error("Erreur lors de l'assignation");
    }
  };

  const handleUnassign = async () => {
    try {
      await updateAsset.mutateAsync({
        id: assetId,
        assigned_to: null,
      });
      toast.success("Équipement désassigné");
      onOpenChange(false);
    } catch (error) {
      toast.error("Erreur lors de la désassignation");
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assigner l'équipement</DialogTitle>
          <DialogDescription>
            {assetName}
          </DialogDescription>
        </DialogHeader>

        {currentAssignee && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentAssignee.avatar_url || undefined} />
                <AvatarFallback>{getInitials(currentAssignee.full_name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{currentAssignee.full_name || currentAssignee.email}</p>
                <p className="text-xs text-muted-foreground">Actuellement assigné</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleUnassign}
              disabled={updateAsset.isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un utilisateur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <ScrollArea className="h-[300px] -mx-6 px-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Chargement...</p>
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <User className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProfiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => handleAssign(profile.id)}
                  disabled={profile.id === currentAssignee?.id || updateAsset.isPending}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback>{getInitials(profile.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {profile.full_name || profile.email}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {profile.department || profile.email}
                    </p>
                  </div>
                  {profile.id === currentAssignee?.id && (
                    <span className="text-xs text-primary">Assigné</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
