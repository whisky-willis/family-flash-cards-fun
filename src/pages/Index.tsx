
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Image, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <Heart className="h-7 w-7 text-black" />
              <span className="text-2xl font-semibold text-black tracking-tight">FamilyCards</span>
            </div>
            <div className="flex items-center space-x-8">
              <Button variant="ghost" onClick={() => navigate('/create')} className="text-gray-700 hover:text-black">
                Create Cards
              </Button>
              <Button onClick={() => navigate('/create')} className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-sm">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 px-6 lg:px-8 relative bg-gradient-to-br from-gray-50 to-white">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{
            backgroundImage: `url('/lovable-uploads/bdad9bb5-4472-4c86-9470-88aad0fc2cd9.png')`
          }}
        />
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
            <Button 
              size="lg" 
              onClick={() => navigate('/create')}
              className="bg-black hover:bg-gray-800 text-white px-8 py-4 text-base font-medium rounded-sm"
            >
              Create Your Cards
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-base px-8 py-4 border-gray-300 hover:bg-gray-50 rounded-sm font-medium"
            >
              See Examples
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-light text-black mb-6 tracking-tight">
              Why choose FamilyCards?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
              Create lasting memories while helping your little ones learn about their loved ones
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-12">
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="text-center pb-6">
                <Image className="h-8 w-8 text-black mx-auto mb-6" />
                <CardTitle className="text-2xl text-black font-light">Personal Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-center text-base leading-relaxed">
                  Upload your favorite family photos to create truly personalized cards that your child will love
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="text-center pb-6">
                <Users className="h-8 w-8 text-black mx-auto mb-6" />
                <CardTitle className="text-2xl text-black font-light">Family Details</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-center text-base leading-relaxed">
                  Add names, birthdays, favorite colors, hobbies, and fun facts to make learning interactive
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="text-center pb-6">
                <Heart className="h-8 w-8 text-black mx-auto mb-6" />
                <CardTitle className="text-2xl text-black font-light">High Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-center text-base leading-relaxed">
                  Professional printing on durable cardstock, perfect for little hands to explore safely
                </CardDescription>
              </CardContent>
            </Card>
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

      {/* CTA Section */}
      <section className="py-24 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center px-6 lg:px-8">
          <h2 className="text-5xl font-light mb-6 tracking-tight">
            Ready to create your family cards?
          </h2>
          <p className="text-xl mb-12 opacity-80 font-light">
            Give your child a special way to learn about the people who love them most
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/create')}
            className="bg-white text-black hover:bg-gray-100 text-base px-8 py-4 rounded-sm font-medium"
          >
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
    </div>
  );
};

export default Index;
