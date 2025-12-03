import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateTicket } from '@/hooks/useTickets';
import { useSearchKBArticles } from '@/hooks/useKnowledgeBase';
import { Loader2, Lightbulb, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CreateTicket() {
  const navigate = useNavigate();
  const createTicket = useCreateTicket();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('incident');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('');

  const { data: suggestedArticles } = useSearchKBArticles(title);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      return;
    }

    await createTicket.mutateAsync({
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      priority,
      category: category || undefined
    });

    navigate('/tickets');
  };

  return (
    <div className="min-h-screen">
      <AppHeader
        title="Nouveau ticket"
        subtitle="Créer une demande ou signaler un incident"
      />
      <div className="p-6">
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link to="/tickets">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux tickets
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="glass-card border-border">
              <CardHeader>
                <CardTitle>Informations du ticket</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select value={type} onValueChange={setType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="incident">Incident</SelectItem>
                          <SelectItem value="request">Demande</SelectItem>
                          <SelectItem value="problem">Problème</SelectItem>
                          <SelectItem value="change">Changement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priorité</Label>
                      <Select value={priority} onValueChange={setPriority}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Basse</SelectItem>
                          <SelectItem value="medium">Moyenne</SelectItem>
                          <SelectItem value="high">Haute</SelectItem>
                          <SelectItem value="critical">Critique</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hardware">Matériel</SelectItem>
                        <SelectItem value="software">Logiciels</SelectItem>
                        <SelectItem value="network">Réseau</SelectItem>
                        <SelectItem value="access">Accès / Droits</SelectItem>
                        <SelectItem value="email">Messagerie</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Titre *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Décrivez brièvement votre problème"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Donnez plus de détails sur votre demande..."
                      rows={6}
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button variant="outline" type="button" onClick={() => navigate('/tickets')}>
                      Annuler
                    </Button>
                    <Button variant="gradient" type="submit" disabled={createTicket.isPending || !title.trim()}>
                      {createTicket.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Créer le ticket
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* KB Suggestions */}
          <div>
            <Card className="glass-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lightbulb className="h-5 w-5 text-warning" />
                  Articles suggérés
                </CardTitle>
              </CardHeader>
              <CardContent>
                {suggestedArticles && suggestedArticles.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Ces articles pourraient vous aider :
                    </p>
                    {suggestedArticles.map((article) => (
                      <Link
                        key={article.id}
                        to={`/knowledge/${article.id}`}
                        className="block p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                      >
                        <p className="text-sm font-medium">{article.title}</p>
                        {article.summary && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {article.summary}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Commencez à taper votre titre pour voir des suggestions d'articles de la base de connaissances.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
