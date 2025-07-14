import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Lightbulb } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6">
            Our Story
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Connecting families through the timeless tradition of card games, one deck at a time.
          </p>
        </div>

        {/* Story Sections */}
        <div className="grid gap-12 max-w-4xl mx-auto">
          {/* Our Family Section */}
          <Card className="backdrop-blur-sm bg-background/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Users className="h-8 w-8 text-primary" />
                Our Family
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lg leading-relaxed">
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
          <Card className="backdrop-blur-sm bg-background/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Lightbulb className="h-8 w-8 text-secondary" />
                The Inspiration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lg leading-relaxed">
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
          <Card className="backdrop-blur-sm bg-background/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Heart className="h-8 w-8 text-accent" />
                How Kindred Cards Began
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lg leading-relaxed">
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
          <Card className="backdrop-blur-sm bg-background/80 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl text-center leading-relaxed">
                To strengthen family bonds by transforming ordinary game nights into extraordinary 
                celebrations of the people and moments that matter most. Because every family 
                deserves to see their story reflected in the games they play together.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;