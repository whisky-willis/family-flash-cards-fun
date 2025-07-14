import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users, Lightbulb, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SignInModal } from "@/components/SignInModal";
import { useState } from "react";

const About = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showSignInModal, setShowSignInModal] = useState(false);
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
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-7xl font-black text-foreground mb-6 leading-tight">
            Our Story
          </h1>
          <p className="text-xl text-foreground/80 font-medium max-w-3xl mx-auto">
            Connecting families through the timeless tradition of card games, one deck at a time.
          </p>
        </div>

        {/* Story Sections */}
        <div className="grid gap-12 max-w-4xl mx-auto">
          {/* Our Family Section */}
          <Card className="backdrop-blur-sm bg-background/90 border-art-pink/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl font-black">
                <Users className="h-8 w-8 text-art-pink" />
                Our Family
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lg leading-relaxed text-foreground/80 font-medium">
              <p>
                Kindred Cards was born from our own family's love for gathering around the table. 
                As parents, we watched our children light up during game nights, seeing how a simple 
                deck of cards could spark laughter, create memories, and bring multiple generations together.
              </p>
              <p>
                We noticed that the most magical moments happened when our kids could see themselves 
                reflected in the games they played. When they recognized faces, places, and stories 
                that mattered to them, the experience became so much more meaningful.
              </p>
            </CardContent>
          </Card>

          {/* The Inspiration Section */}
          <Card className="backdrop-blur-sm bg-background/90 border-art-green/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl font-black">
                <Lightbulb className="h-8 w-8 text-art-green" />
                The Inspiration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lg leading-relaxed text-foreground/80 font-medium">
              <p>
                The idea struck during a rainy weekend when our usual deck of cards was missing a few pieces. 
                Our youngest asked, "Why can't we have cards with our family on them?" That innocent question 
                sparked something bigger than we could have imagined.
              </p>
              <p>
                We realized that while there were countless generic card games on the market, there was 
                nothing that truly celebrated the unique bonds within each family. Every family has their 
                own stories, traditions, and special moments that deserve to be celebrated.
              </p>
            </CardContent>
          </Card>

          {/* How Kindred Cards Started Section */}
          <Card className="backdrop-blur-sm bg-background/90 border-art-blue/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl font-black">
                <Heart className="h-8 w-8 text-art-blue" />
                How Kindred Cards Began
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lg leading-relaxed text-foreground/80 font-medium">
              <p>
                What started as a weekend project to create custom cards for our own family quickly 
                grew into something much larger. We spent months perfecting the design, testing different 
                games, and refining the experience based on feedback from friends and extended family.
              </p>
              <p>
                The response was overwhelming. Every family that tried our personalized cards had the 
                same reaction - pure joy and excitement. Kids who rarely put down their devices were 
                suddenly engaged for hours, grandparents were sharing stories prompted by the familiar 
                faces on the cards, and families were creating new traditions.
              </p>
              <p>
                We knew we had to share this magic with other families. Kindred Cards was officially 
                born with a simple mission: to help families create lasting memories through the power 
                of personalized play.
              </p>
            </CardContent>
          </Card>

          {/* Our Mission Section */}
          <Card className="backdrop-blur-sm bg-background/90 border-art-yellow/20">
            <CardHeader>
              <CardTitle className="text-2xl font-black text-center">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl text-center leading-relaxed text-foreground/80 font-medium">
                To strengthen family bonds by transforming ordinary game nights into extraordinary 
                celebrations of the people and moments that matter most. Because every family 
                deserves to see their story reflected in the games they play together.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <SignInModal 
        open={showSignInModal} 
        onOpenChange={setShowSignInModal} 
      />
    </div>
  );
};

export default About;