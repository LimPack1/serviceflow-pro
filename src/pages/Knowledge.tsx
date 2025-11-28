import { AppHeader } from "@/components/layout/AppHeader";
import { KnowledgeBase } from "@/components/knowledge/KnowledgeBase";

export default function Knowledge() {
  return (
    <div className="min-h-screen">
      <AppHeader
        title="Base de connaissances"
        subtitle="Documentation et guides"
      />
      <div className="p-6">
        <KnowledgeBase />
      </div>
    </div>
  );
}
