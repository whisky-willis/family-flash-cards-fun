import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Pricing = () => {
  const navigate = useNavigate();

  // SEO: title, meta description, canonical, JSON-LD
  useEffect(() => {
    const title = "Pricing | Kindred Cards – $3.99 or 4 for $14.99";
    document.title = title;

    const metaDescContent =
      "Card pricing: $3.99 per card or 4-card bundle for $14.99. Create custom family learning cards.";
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = metaDescContent.slice(0, 160);

    const canonicalHref = `${window.location.origin}/pricing`;
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = canonicalHref;

    // Structured data (JSON-LD) for pricing offers
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Kindred Cards – Custom Family Learning Cards",
      description: metaDescContent,
      brand: { "@type": "Brand", name: "Kindred Cards" },
      offers: [
        {
          "@type": "Offer",
          price: "3.99",
          priceCurrency: "USD",
          url: canonicalHref,
          availability: "https://schema.org/InStock"
        },
        {
          "@type": "Offer",
          name: "4-card bundle",
          price: "14.99",
          priceCurrency: "USD",
          url: canonicalHref,
          availability: "https://schema.org/InStock"
        }
      ]
    });
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-art-pink rounded-full blur-xl opacity-30 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-art-green rounded-full blur-xl opacity-35 translate-y-1/3" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-art-blue rounded-full blur-xl opacity-30" />
      </div>

      {/* Simple nav */}
      <nav className="bg-background/90 backdrop-blur-sm sticky top-0 z-50 border-b border-border/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src="/lovable-uploads/5128289b-d7c7-4d2c-9975-2651dcb38ae0.png"
                alt="Kindred Cards logo"
                className="h-12 w-32 object-cover object-center cursor-pointer"
                onClick={() => navigate("/")}
              />
            </div>
            <div className="hidden md:flex space-x-6 text-sm font-medium uppercase tracking-wide">
              <span className="text-foreground/70 hover:text-foreground cursor-pointer" onClick={() => navigate('/about')}>About</span>
              <span className="text-primary font-bold cursor-pointer">Pricing</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button onClick={() => navigate('/create')} size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                Create Cards
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main role="main" className="relative z-10">
        {/* Header */}
        <header className="text-center mt-10 px-6">
          <h1 className="text-5xl lg:text-6xl font-black text-foreground leading-tight">
            Card Pricing: $3.99 or 4 for $14.99
          </h1>
          <p className="mt-4 text-lg text-foreground/80 font-medium max-w-2xl mx-auto">
            Simple, transparent pricing. Create beautiful custom family learning cards.
          </p>
        </header>

        {/* Pricing cards */}
        <section className="max-w-6xl mx-auto px-6 lg:px-8 py-12 grid gap-6 md:grid-cols-2">
          <article className="rounded-3xl border border-border bg-card text-card-foreground shadow-sm p-8 flex flex-col">
            <div>
              <h2 className="text-2xl font-black">Single Card</h2>
              <p className="mt-2 text-foreground/70">Best for trying it out</p>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-5xl font-black tracking-tight">$3.99</span>
                <span className="text-sm text-foreground/70">per card</span>
              </div>
              <ul className="mt-6 space-y-2 text-sm text-foreground/80">
                <li>• High-quality print</li>
                <li>• Front and back customization</li>
                <li>• Ships in 3–5 business days</li>
              </ul>
            </div>
            <Button onClick={() => navigate('/create')} className="mt-8">Create a Card</Button>
          </article>

          <article className="rounded-3xl border-2 border-primary bg-card text-card-foreground shadow-md p-8 flex flex-col relative overflow-hidden">
            <div className="absolute -right-10 -top-8 rotate-12 bg-primary text-primary-foreground px-6 py-2 text-xs font-bold uppercase tracking-wider rounded-full">
              Best value
            </div>
            <div>
              <h2 className="text-2xl font-black">4-Card Bundle</h2>
              <p className="mt-2 text-foreground/70">Group discount</p>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-5xl font-black tracking-tight">$14.99</span>
                <span className="text-sm text-foreground/70">for 4 cards</span>
              </div>
              <p className="mt-1 text-sm text-foreground/70">≈ $3.75 per card</p>
              <ul className="mt-6 space-y-2 text-sm text-foreground/80">
                <li>• Everything in Single Card</li>
                <li>• Best for gifts and siblings</li>
                <li>• Priority printing</li>
              </ul>
            </div>
            <Button onClick={() => navigate('/create')} className="mt-8">Create 4 Cards</Button>
          </article>
        </section>

        <section className="text-center pb-16">
          <p className="text-foreground/70">Need more than 4? Add as many as you like at checkout.</p>
        </section>
      </main>
    </div>
  );
};

export default Pricing;
