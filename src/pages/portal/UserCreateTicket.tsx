import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCreateTicket } from "@/hooks/useTickets";
import { useKBArticles } from "@/hooks/useKnowledgeBase";
import { ArrowLeft, Send, Lightbulb, BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories = [
  { value: "hardware", label: "Matériel" },
  { value: "software", label: "Logiciel" },
  { value: "network", label: "Réseau" },
  { value: "access", label: "Accès / Droits" },
  { value: "email", label: "Messagerie" },
  { value: "other", label: "Autre" }
];

const ticketTypes = [
  { value: "incident", label: "Incident", description: "Un problème qui perturbe votre travail" },
  { value: "request", label: "Demande", description: "Une nouvelle demande de service" }
];

export default function UserCreateTicket() {
  const navigate = useNavigate();
  const createTicket = useCreateTicket();
  const { data: articles } = useKBArticles();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<string>("incident");
  const [category, setCategory] = useState<string>("");

  // Find related articles based on title keywords
  const relatedArticles = articles?.filter(article => {
    if (!title || title.length < 3) return false;
    const titleWords = title.toLowerCase().split(' ').filter(w => w.length > 2);
    return titleWords.some(word => 
      article.title.toLowerCase().includes(word) ||
      article.summary?.toLowerCase().includes(word)
    );
  }).slice(0, 3) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await createTicket.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        type,
        category: category || undefined
      });
      navigate("/portal/tickets");
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/portal">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nouveau ticket</h1>
          <p className="text-muted-foreground">Décrivez votre problème ou demande</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type Selection */}
              <div className="space-y-3">
                <Label>Type de demande</Label>
                <div className="grid grid-cols-2 gap-3">
                  {ticketTypes.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(t.value)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        type === t.value
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "hover:border-primary/50"
                      }`}
                    >
                      <p className="font-medium">{t.label}</p>
                      <p className="text-sm text-muted-foreground">{t.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  placeholder="Résumez votre problème en quelques mots"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez le problème en détail : quand est-il apparu, quelles actions avez-vous tentées..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" asChild>
                  <Link to="/portal">Annuler</Link>
                </Button>
                <Button type="submit" disabled={createTicket.isPending || !title.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  {createTicket.isPending ? "Envoi..." : "Soumettre le ticket"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Sidebar - Related Articles */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                Articles suggérés
              </CardTitle>
              <CardDescription>
                Ces articles pourraient vous aider
              </CardDescription>
            </CardHeader>
            <CardContent>
              {relatedArticles.length > 0 ? (
                <div className="space-y-3">
                  {relatedArticles.map((article) => (
                    <Link
                      key={article.id}
                      to={`/portal/knowledge/${article.id}`}
                      className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <BookOpen className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm line-clamp-2">{article.title}</p>
                          {article.summary && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {article.summary}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Commencez à saisir un titre pour voir des suggestions
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Conseil :</strong> Plus votre description est détaillée, plus vite nous pourrons résoudre votre problème.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
