"use client"

import React from 'react';
import { MapPin, AlertTriangle, LogIn, UserPlus, Menu, X, Shield, Users, BookOpen, FacebookIcon, TwitterIcon, InstagramIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';

function App() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const navigation = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-stone-700" />
              <span className="ml-2 text-xl font-semibold text-stone-800">SafeSteps</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-stone-600 hover:text-stone-900 px-3 py-2 rounded-md text-sm font-medium flex items-center hover:cursor-pointer">
                  <LogIn className="h-4 w-4 mr-1" />
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-stone-700 text-white hover:bg-stone-800 px-4 py-2 rounded-md text-sm font-medium flex items-center hover:cursor-pointer">
                  <UserPlus className="h-4 w-4 mr-1" />
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <div className='hover:cursor-pointer'>
              <SignedIn>
                <div>
                  <UserButton/>
                </div>
              </SignedIn>
            </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-stone-600 hover:text-stone-900"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <button className="text-stone-600 hover:text-stone-900 block px-3 py-2 rounded-md text-base font-medium w-full text-left">
                Sign In
              </button>
              <button className="bg-stone-700 text-white hover:bg-stone-800 block px-3 py-2 rounded-md text-base font-medium w-full text-left">
                Sign Up
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-stone-800 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-8">
              <Shield className="h-16 w-16 text-stone-200" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Travel Safely Anywhere
            </h1>
            <p className="mt-6 text-xl text-stone-300 max-w-3xl mx-auto">
              Stay informed about common scams and safety concerns in tourist destinations worldwide. 
              Protect yourself and others by exploring our safety map and reporting incidents.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-stone-600 hover:bg-stone-700 transition-colors hover:cursor-pointer" onClick={() => navigation.push("/map")}>
                <MapPin className="h-5 w-5 mr-2" />
                Explore Map
              </button>
              <button className="inline-flex items-center px-8 py-4 border-2 border-stone-300 text-lg font-medium rounded-md text-white hover:bg-stone-700 transition-colors hover:cursor-pointer" onClick={() => navigation.push("/report")}>
                <AlertTriangle className="h-5 w-5 mr-2" />
                Report Scam
              </button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-stone-900">Stay Safe While Traveling</h2>
              <p className="mt-4 text-lg text-stone-600">Our platform helps you make informed decisions about your safety.</p>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="p-8 bg-stone-50 rounded-lg text-center hover:shadow-lg transition-shadow">
                <Shield className="h-10 w-10 text-stone-700 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-stone-900">Real-time Updates</h3>
                <p className="mt-4 text-stone-600">Get the latest information about scams and safety concerns in your destination.</p>
              </div>
              <div className="p-8 bg-stone-50 rounded-lg text-center hover:shadow-lg transition-shadow">
                <Users className="h-10 w-10 text-stone-700 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-stone-900">Community Reports</h3>
                <p className="mt-4 text-stone-600">Learn from other travelers' experiences and contribute your own insights.</p>
              </div>
              <div className="p-8 bg-stone-50 rounded-lg text-center hover:shadow-lg transition-shadow">
                <BookOpen className="h-10 w-10 text-stone-700 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-stone-900">Safety Tips</h3>
                <p className="mt-4 text-stone-600">Access comprehensive guides on staying safe while traveling abroad.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-stone-100 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-stone-900">Join Our Community</h2>
            <p className="mt-4 text-lg text-stone-600 max-w-2xl mx-auto">
              Help make travel safer for everyone by sharing your experiences and staying informed.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-stone-800 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold">SafeSteps</h3>
              <p className="mt-2 text-stone-400">Making travel safer for everyone.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Quick Links</h3>
              <ul className="mt-2 space-y-2">
                <li><a href="#" className="text-stone-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-stone-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-stone-400 hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Follow Us</h3>
              <div className="mt-2 flex space-x-4">
                <a href="#" className="text-stone-400 hover:text-white transition-colors">
                  <FacebookIcon className="h-6 w-6" />
                </a>
                <a href="#" className="text-stone-400 hover:text-white transition-colors">
                  <TwitterIcon className="h-6 w-6" />
                </a>
                <a href="#" className="text-stone-400 hover:text-white transition-colors">
                  <InstagramIcon className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-stone-700 text-center text-stone-400">
            <p>&copy; {new Date().getFullYear()} SafeSteps. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;