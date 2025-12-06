import { Monitor, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useInterfaceMode } from "@/contexts/InterfaceModeContext";
import { cn } from "@/lib/utils";

interface InterfaceSwitchProps {
  collapsed?: boolean;
}

export function InterfaceSwitch({ collapsed = false }: InterfaceSwitchProps) {
  const { mode, toggleMode, canSwitchMode } = useInterfaceMode();

  if (!canSwitchMode) {
    return null;
  }

  const isSIMode = mode === 'si';

  const button = (
    <Button
      variant="outline"
      size={collapsed ? "icon" : "sm"}
      onClick={toggleMode}
      className={cn(
        "gap-2 transition-all",
        isSIMode 
          ? "border-primary/50 bg-primary/10 hover:bg-primary/20" 
          : "border-accent/50 bg-accent/10 hover:bg-accent/20"
      )}
    >
      {isSIMode ? (
        <>
          <Monitor className="h-4 w-4" />
          {!collapsed && <span>Mode SI</span>}
        </>
      ) : (
        <>
          <User className="h-4 w-4" />
          {!collapsed && <span>Mode User</span>}
        </>
      )}
    </Button>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right">
          {isSIMode ? "Passer en mode Utilisateur" : "Passer en mode SI"}
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}
