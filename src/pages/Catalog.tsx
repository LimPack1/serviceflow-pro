import { AppHeader } from "@/components/layout/AppHeader";
import { ServiceCatalog } from "@/components/catalog/ServiceCatalog";

export default function Catalog() {
  return (
    <div className="min-h-screen">
      <AppHeader
        title="Catalogue de services"
        subtitle="Demandez un service ou une prestation IT"
      />
      <div className="p-6">
        <ServiceCatalog />
      </div>
    </div>
  );
}
