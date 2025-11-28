import { AppHeader } from "@/components/layout/AppHeader";
import { TicketList } from "@/components/tickets/TicketList";

export default function Tickets() {
  return (
    <div className="min-h-screen">
      <AppHeader
        title="Gestion des tickets"
        subtitle="Incidents, demandes, problèmes et changements"
      />
      <div className="p-6">
        <TicketList />
      </div>
    </div>
  );
}
