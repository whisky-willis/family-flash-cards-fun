import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Heart, Users, Image, ArrowRight, Brain, BookOpen, Smile, Target, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
const Index = () => {
  const navigate = useNavigate();
  return <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <Heart className="h-7 w-7 text-black" />
              <span className="text-2xl font-semibold text-black tracking-tight">FamilyCards</span>
            </div>
            <div className="flex items-center space-x-8">
              <Button onClick={() => navigate('/create')} className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-sm">
                Create Cards
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 px-6 lg:px-8 relative bg-gradient-to-br from-gray-50 to-white">
        <div className="absolute inset-0 bg-cover bg-top bg-no-repeat opacity-30" style={{
        backgroundImage: `url('/lovable-uploads/38ef78d9-ed91-4669-9853-b2edf0a11427.png')`
      }} />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-6xl lg:text-7xl font-light text-black mb-8 tracking-tight leading-tight">
            Help George learn about
            <span className="block font-normal">family & friends</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            Create personalized flashcards featuring your family and friends. Perfect for babies and toddlers 
            to learn names, faces, and stories about the people they love most.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/create')} className="bg-black hover:bg-gray-800 text-white px-8 py-4 text-base font-medium rounded-sm">
              Create Your Cards
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 py-4 border-gray-300 hover:bg-gray-50 rounded-sm font-medium">
              See Examples
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-light text-black mb-6 tracking-tight">
              How it works
            </h2>
            <p className="text-xl text-gray-600 font-light">
              Creating your custom family cards is simple
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-16">
            <div className="text-center">
              <div className="bg-black text-white rounded-full w-12 h-12 flex items-center justify-center text-lg font-medium mx-auto mb-8">
                1
              </div>
              <h3 className="text-2xl font-light text-black mb-4">Upload Photos</h3>
              <p className="text-gray-600 text-base leading-relaxed">
                Add photos of family members and friends you want to include
              </p>
            </div>

            <div className="text-center">
              <div className="bg-black text-white rounded-full w-12 h-12 flex items-center justify-center text-lg font-medium mx-auto mb-8">
                2
              </div>
              <h3 className="text-2xl font-light text-black mb-4">Add Details</h3>
              <p className="text-gray-600 text-base leading-relaxed">
                Fill in names, birthdays, favorite things, and fun facts
              </p>
            </div>

            <div className="text-center">
              <div className="bg-black text-white rounded-full w-12 h-12 flex items-center justify-center text-lg font-medium mx-auto mb-8">
                3
              </div>
              <h3 className="text-2xl font-light text-black mb-4">Order & Enjoy</h3>
              <p className="text-gray-600 text-base leading-relaxed">
                Review your cards and place your order - we'll handle the rest
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Developmental Benefits Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-light text-black mb-6 tracking-tight">Backed by Research</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
              University research proves that children who engage in family storytelling and cultural learning 
              demonstrate higher academic performance, stronger emotional health, and better social skills compared to their peers.
            </p>
          </div>
          
          <Carousel opts={{ align: "start", slidesToScroll: 1, skipSnaps: false }} className="max-w-5xl mx-auto mb-16">
            <CarouselContent>
              <CarouselItem className="md:basis-1/2 lg:basis-1/2">
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm h-full">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <Brain className="h-6 w-6 text-blue-600" />
                      <CardTitle className="text-xl text-black font-medium">Boosts Academic Performance</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-700 text-base leading-relaxed mb-4">
                      Children who engage in family storytelling show higher language and literacy skills that last through 
                      elementary school, with benefits extending 7 years down the line.
                    </CardDescription>
                    <a href="https://childandfamilypolicy.duke.edu/news/the-power-of-storytelling-how-parents-and-caregivers-can-give-children-a-strong-foundation-for-language-and-literacy-development/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm font-medium underline">
                      Source: Duke University Family Life Project
                    </a>
                  </CardContent>
                </Card>
              </CarouselItem>

              <CarouselItem className="md:basis-1/2 lg:basis-1/2">
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm h-full">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <Smile className="h-6 w-6 text-pink-600" />
                      <CardTitle className="text-xl text-black font-medium">Builds Emotional Intelligence</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-700 text-base leading-relaxed mb-4">
                      Develops empathy, self-awareness, and social skills that lead to better relationships and reduced 
                      anxiety - core foundations for lifelong success.
                    </CardDescription>
                    <a href="https://casel.org/fundamentals-of-sel/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm font-medium underline">
                      Source: CASEL Research
                    </a>
                  </CardContent>
                </Card>
              </CarouselItem>

              <CarouselItem className="md:basis-1/2 lg:basis-1/2">
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm h-full">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <UserCheck className="h-6 w-6 text-green-600" />
                      <CardTitle className="text-xl text-black font-medium">Strengthens Identity & Self-Esteem</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-700 text-base leading-relaxed mb-4">
                      Research shows kids who know more about their families have stronger self-control, higher confidence, 
                      and believe their families function better.
                    </CardDescription>
                    <a href="https://abclifeliteracy.ca/news/5-benefits-of-learning-about-your-heritage/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm font-medium underline">
                      Source: Emory University Study
                    </a>
                  </CardContent>
                </Card>
              </CarouselItem>

              <CarouselItem className="md:basis-1/2 lg:basis-1/2">
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm h-full">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <Target className="h-6 w-6 text-purple-600" />
                      <CardTitle className="text-xl text-black font-medium">Develops Critical Thinking</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-700 text-base leading-relaxed mb-4">
                      Encourages children to ask questions, understand different perspectives, and make connections - 
                      essential skills for school and life.
                    </CardDescription>
                    <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC6305786/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm font-medium underline">
                      Source: Brain Imaging Studies
                    </a>
                  </CardContent>
                </Card>
              </CarouselItem>

              <CarouselItem className="md:basis-1/2 lg:basis-1/2">
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm h-full">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <Heart className="h-6 w-6 text-red-500" />
                      <CardTitle className="text-xl text-black font-medium">Creates Lasting Family Bonds</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-700 text-base leading-relaxed mb-4">
                      Transforms screen time into meaningful conversation time, building trust and communication skills through interactive play.
                    </CardDescription>
                    <a href="https://www.naeyc.org/resources/pubs/yc/mar2018/promoting-social-and-emotional-health" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm font-medium underline">
                      Source: NAEYC Research
                    </a>
                  </CardContent>
                </Card>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center px-6 lg:px-8">
          <h2 className="text-5xl font-light mb-6 tracking-tight">
            Ready to create your family cards?
          </h2>
          <p className="text-xl mb-12 opacity-80 font-light">
            Give your child a special way to learn about the people who love them most
          </p>
          <Button size="lg" onClick={() => navigate('/create')} className="bg-white text-black hover:bg-gray-100 text-base px-8 py-4 rounded-sm font-medium">
            Start Creating Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Heart className="h-6 w-6 text-black" />
              <span className="text-xl font-semibold text-black">FamilyCards</span>
            </div>
            <p className="text-gray-600 font-light">
              Creating memories, one card at a time
            </p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;