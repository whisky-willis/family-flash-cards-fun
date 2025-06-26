
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Image } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-pink-500" />
              <span className="text-2xl font-bold text-gray-800">FamilyCards</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/create')}>
                Create Cards
              </Button>
              <Button onClick={() => navigate('/create')} className="bg-pink-500 hover:bg-pink-600">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Help Your Child Learn About
            <span className="text-pink-500 block">Family & Friends</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Create personalized flashcards featuring your family and friends. Perfect for babies and toddlers 
            to learn names, faces, and fun facts about the people they love most.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/create')}
              className="bg-pink-500 hover:bg-pink-600 text-lg px-8 py-4"
            >
              Create Your Cards
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-4 border-pink-200 hover:bg-pink-50"
            >
              See Examples
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose FamilyCards?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Create lasting memories while helping your little ones learn about their loved ones
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-pink-100 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Image className="h-12 w-12 text-pink-500 mx-auto mb-4" />
                <CardTitle className="text-2xl text-gray-800">Personal Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-center">
                  Upload your favorite family photos to create truly personalized cards that your child will love
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-blue-100 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <CardTitle className="text-2xl text-gray-800">Family Details</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-center">
                  Add names, birthdays, favorite colors, hobbies, and fun facts to make learning interactive
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-green-100 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Heart className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <CardTitle className="text-2xl text-gray-800">High Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-center">
                  Professional printing on durable cardstock, perfect for little hands to explore safely
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-pink-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Creating your custom family cards is easy!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-pink-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Upload Photos</h3>
              <p className="text-gray-600">
                Add photos of family members and friends you want to include
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Add Details</h3>
              <p className="text-gray-600">
                Fill in names, birthdays, favorite things, and fun facts
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Order & Enjoy</h3>
              <p className="text-gray-600">
                Review your cards and place your order - we'll handle the rest!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-pink-500 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Create Your Family Cards?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Give your child a special way to learn about the people who love them most
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/create')}
            className="bg-white text-pink-500 hover:bg-gray-100 text-lg px-8 py-4"
          >
            Start Creating Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Heart className="h-6 w-6 text-pink-400" />
              <span className="text-xl font-bold">FamilyCards</span>
            </div>
            <p className="text-gray-400">
              Creating memories, one card at a time
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
