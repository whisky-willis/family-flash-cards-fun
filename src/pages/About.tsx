
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";

import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SignInModal } from "@/components/SignInModal";
import { useEffect, useState } from "react";

const About = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showSignInModal, setShowSignInModal] = useState(false);

  // SEO: set title, description, canonical
  useEffect(() => {
    const title = "About Us | Kindred Cards";
    document.title = title;

    const metaDescContent = "About Kindred Cards: our family story, why we created it, and our mission to help kids connect with loved ones across distances.";
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = metaDescContent.slice(0, 160);

    const canonicalHref = `${window.location.origin}/about`;
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = canonicalHref;
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Organic background shapes inspired by Art Center */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-art-pink rounded-full filter blur-xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-art-green rounded-full filter blur-xl opacity-35 translate-y-1/3"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-art-blue rounded-full filter blur-xl opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 w-56 h-56 bg-art-orange rounded-full filter blur-xl opacity-35 -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* Top banner */}
      <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium relative z-10">
        Now available: Create custom family learning cards!
      </div>

      {/* Navigation - Art Center style */}
      <nav className="bg-background/90 backdrop-blur-sm sticky top-0 z-50 border-b border-border/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:justify-between">
            <div className="flex items-center space-x-8 flex-1 md:flex-initial">
              <div className="flex items-center space-x-3">
                <img 
                  src="/lovable-uploads/5128289b-d7c7-4d2c-9975-2651dcb38ae0.png" 
                  alt="Kindred Cards" 
                  className="h-12 w-32 object-cover object-center cursor-pointer" 
                  onClick={() => navigate('/')}
                />
              </div>
              <div className="hidden md:flex space-x-6 text-sm font-medium uppercase tracking-wide">
                <span className="text-primary font-bold cursor-pointer">About</span>
                <span 
                  className="text-foreground/70 hover:text-foreground cursor-pointer" 
                  onClick={() => navigate('/#card-examples')}
                >
                  Examples
                </span>
                <span className="text-foreground/70 hover:text-foreground cursor-pointer">Pricing</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button onClick={() => navigate('/create')} size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                Create Cards
              </Button>
              {user ? (
                <Button onClick={() => navigate('/profile')} variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                  Profile
                </Button>
              ) : (
                <Button onClick={() => setShowSignInModal(true)} variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                  Sign In
                </Button>
              )}
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                0
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <main role="main" className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-5xl lg:text-7xl font-black text-foreground mb-6 leading-tight">
              About Us
            </h1>
          </header>

          <section aria-label="Photo placeholders" className="mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <figure className="rounded-2xl overflow-hidden shadow-2xl bg-muted">
                <AspectRatio ratio={4/3}>
                  <img src="/placeholder.svg" alt="Family photo placeholder for Kindred Cards" className="w-full h-full object-cover" loading="lazy" />
                </AspectRatio>
                <figcaption className="sr-only">Family photo placeholder</figcaption>
              </figure>
              <figure className="rounded-2xl overflow-hidden shadow-2xl bg-muted">
                <AspectRatio ratio={4/3}>
                  <img src="/placeholder.svg" alt="New York adventure placeholder image" className="w-full h-full object-cover" loading="lazy" />
                </AspectRatio>
                <figcaption className="sr-only">New York adventure placeholder</figcaption>
              </figure>
              <figure className="rounded-2xl overflow-hidden shadow-2xl bg-muted">
                <AspectRatio ratio={4/3}>
                  <img src="/placeholder.svg" alt="Parents and baby placeholder image" className="w-full h-full object-cover" loading="lazy" />
                </AspectRatio>
                <figcaption className="sr-only">Parents and baby placeholder</figcaption>
              </figure>
            </div>
          </section>

          <section aria-labelledby="intro" className="space-y-6 text-lg leading-relaxed text-foreground/80 font-medium">
            <p><strong>Hi! We&apos;re Nick and Baileigh, and we&apos;re the proud parents behind Kindred Cards.</strong></p>
            <p>We&apos;re a British family living our New York adventure. In 2022, we took a leap of faith and moved from the UK to New York, planning to stay for just two years. What started as an exciting opportunity has turned into an incredible three-year journey.</p>
            <p>In July 2024, our world changed forever when George arrived—born right here in New York. Watching him grow and discover the world around him has been the most amazing part of our American adventure. But as new parents living an ocean away from home, we quickly realized we faced a unique challenge that many modern families know all too well.</p>
          </section>

          <section aria-labelledby="why" className="mt-10 space-y-6 text-lg leading-relaxed text-foreground/80 font-medium">
            <h2 id="why" className="text-3xl lg:text-4xl font-black text-foreground">Why We Created Kindred Cards</h2>
            <p>As new parents living an ocean away from home, we faced a challenge that many modern families know all too well: how do you help your child truly know their family and friends when distance keeps you apart?</p>
            <p>While FaceTime calls and occasional visits are wonderful, we wanted George to understand that his grandparents, aunts, uncles, and family friends are real people with stories, personalities, and love to share—not just faces on a screen.</p>
            <p>That&apos;s when the idea for Kindred Cards was born. We wanted to create something educational and engaging that would help George learn about his family back home in a way that encourages storytelling, builds connections, and supports his development.</p>
          </section>

          <section aria-labelledby="mission" className="mt-10 space-y-6 text-lg leading-relaxed text-foreground/80 font-medium">
            <h2 id="mission" className="text-3xl lg:text-4xl font-black text-foreground">Our Mission</h2>
            <p>We believe every child deserves to know their family story, no matter how far apart they may be. Kindred Cards transforms the challenge of distance into an opportunity for deeper connection, turning family learning into playtime and creating lasting bonds that span continents.</p>
            <p>From our family to yours,<br /><strong>Nick, Baileigh &amp; George</strong></p>
          </section>
        </main>
      </div>
      
      <SignInModal 
        open={showSignInModal} 
        onOpenChange={setShowSignInModal} 
      />
    </div>
  );
};

export default About;