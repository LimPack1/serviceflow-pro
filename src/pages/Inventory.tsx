import { AppHeader } from "@/components/layout/AppHeader";
import { InventoryList } from "@/components/inventory/InventoryList";

export default function Inventory() {
  return (
    <div className="min-h-screen">
      <AppHeader
        title="Inventaire CMDB"
        subtitle="Gestion du parc informatique"
      />
      <div className="p-6">
        <InventoryList />
      </div>
    </div>
  );
}
