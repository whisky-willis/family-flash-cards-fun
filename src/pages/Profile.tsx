import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDraft } from '@/hooks/useDraft';
import { CardPreview } from '@/components/CardPreview';
import { FamilyCard } from '@/pages/CreateCards';
import { User, Calendar, Trash2 } from 'lucide-react';

interface CardCollection {
  id: string;
  name: string;
  description: string | null;
  cards: FamilyCard[];
  deck_design: any;
  created_at: string;
  updated_at: string;
}

const kindredLogo = "/lovable-uploads/b059ee5b-3853-4004-9b40-6da60dbfe02f.png";

export default function Profile() {
  const [collections, setCollections] = useState<CardCollection[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, signOut, loading } = useAuth();
  const { toast } = useToast();
  const { saveDraftToLocal } = useDraft();
  const navigate = useNavigate();

  // Redirect to auth if not logged in (but wait for auth to finish loading)
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
  }, [user, loading, navigate]);

  // Fetch user profile and collections
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch collections
        const { data: collectionsData, error: collectionsError } = await supabase
          .from('card_collections')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (collectionsError) throw collectionsError;
        setCollections((collectionsData || []).map(collection => ({
          ...collection,
          cards: Array.isArray(collection.cards) ? collection.cards as unknown as FamilyCard[] : []
        })));
      } catch (err: any) {
        setError(err.message || 'Failed to load profile data');
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleDeleteCollection = async (collectionId: string, collectionName: string) => {
    if (!confirm(`Are you sure you want to delete "${collectionName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('card_collections')
        .delete()
        .eq('id', collectionId);

      if (error) throw error;

      setCollections(collections.filter(c => c.id !== collectionId));
      toast({
        title: "Collection Deleted",
        description: `"${collectionName}" has been deleted successfully.`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || 'Failed to delete collection',
        variant: "destructive",
      });
    }
  };

  const handleLoadCollection = (collection: CardCollection) => {
    // Load the collection's cards and deck design into draft
    const deckDesign = collection.deck_design || {
      recipientName: collection.name,
      theme: undefined,
      font: undefined
    };
    
    console.log('📂 Loading collection from profile:', collection.name, 'with deck design:', deckDesign);
    saveDraftToLocal(collection.cards, deckDesign);
    
    // Navigate to create page
    navigate('/create');
    
    toast({
      title: "Collection Loaded",
      description: `Loaded ${collection.cards.length} cards from "${collection.name}" into draft.`,
    });
  };

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-art-pink rounded-full filter blur-xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-art-yellow rounded-full filter blur-xl opacity-40 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-art-green rounded-full filter blur-xl opacity-35 translate-y-1/3"></div>
      </div>

      {/* Navigation */}
      <nav className="bg-background/90 backdrop-blur-sm sticky top-0 z-50 border-b border-border/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <img 
                src={kindredLogo} 
                alt="Kindred Cards" 
                className="h-12 w-32 object-cover object-center cursor-pointer hover:opacity-80 transition-opacity" 
                onClick={() => navigate('/')}
              />
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => navigate('/create')} variant="outline">
                Create Cards
              </Button>
              <Button onClick={signOut} variant="outline">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 relative z-10">
        {/* Profile Header */}
        <div className="mb-8">
          <Card className="bg-white/90 backdrop-blur-sm border-2 border-art-pink/20 rounded-3xl shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black">
                    {profile?.name || user.email}
                  </CardTitle>
                  <CardDescription>
                    Member since {new Date(user.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Collections Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-black text-foreground">
              My Card Collections
            </h2>
            <Button onClick={() => navigate('/create')}>
              Create New Collection
            </Button>
          </div>

          {dataLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-white/90 backdrop-blur-sm border-2 border-art-blue/20 rounded-3xl shadow-lg">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : collections.length === 0 ? (
            <Card className="bg-white/90 backdrop-blur-sm border-2 border-art-yellow/20 rounded-3xl shadow-lg">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-bold text-foreground mb-2">No Collections Yet</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Start creating your first family card collection to see them here.
                </p>
                <Button onClick={() => navigate('/create')}>
                  Create Your First Collection
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((collection) => (
                <Card 
                  key={collection.id} 
                  className="bg-white/90 backdrop-blur-sm border-2 border-art-blue/20 rounded-3xl shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
                  onClick={() => handleLoadCollection(collection)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold mb-1">
                          {collection.name}
                        </CardTitle>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(collection.created_at).toLocaleDateString()}</span>
                        </div>
                        <Badge variant="secondary" className="mb-2">
                          {collection.cards.length} cards
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCollection(collection.id, collection.name);
                        }}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {collection.description && (
                      <CardDescription className="text-sm">
                        {collection.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {collection.cards.length > 0 ? (
                      <div className="space-y-2">
                        {collection.cards.map((card, index) => (
                          <div key={card.id || index} className="flex items-center justify-between py-2 px-3 bg-muted/20 rounded-lg">
                            <span className="font-medium text-sm">{card.name}</span>
                            <Badge variant="outline" className="text-xs">
                              Card
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No cards in this collection
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}