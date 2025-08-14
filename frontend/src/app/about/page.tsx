'use client';

import { Header } from '@/components/header';
import Link from 'next/link';
import { Music, TrendingUp, Users, Briefcase, GraduationCap, Heart, Globe, Zap, Shield, Mail } from 'lucide-react';
import { ALLOWED_DOMAINS } from '@/lib/allowed-domains';
import { useState } from 'react';

export default function AboutPage() {
  const [showAllDomains, setShowAllDomains] = useState(false);
  
  // Get sample domains for display
  const sampleLabels = ALLOWED_DOMAINS.recordLabels.slice(0, 5);
  const sampleIndustry = ALLOWED_DOMAINS.musicIndustry.slice(0, 5);
  const totalDomains = ALLOWED_DOMAINS.educational.length +
                       ALLOWED_DOMAINS.recordLabels.length + 
                       ALLOWED_DOMAINS.musicIndustry.length + 
                       ALLOWED_DOMAINS.invited.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            About Music Monitor
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Empowering the next generation of A&R professionals to discover rising talent together
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-6 h-6 text-spotify-green" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Our Mission</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Music Monitor bridges the gap between aspiring A&R professionals and the music industry. 
            We believe that talent scouting shouldn't be a solitary pursuit—it should be a collaborative 
            effort that benefits the entire music ecosystem. By providing data-driven insights and fostering 
            a community of music discovery, we're democratizing the A&R process.
          </p>
        </div>

        {/* Who It's For */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <GraduationCap className="w-6 h-6 text-spotify-green" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">For Students</h3>
            </div>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-spotify-green mt-1">•</span>
                <span>Build a portfolio of artists you're tracking to showcase your A&R instincts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-spotify-green mt-1">•</span>
                <span>Demonstrate your ability to spot trends before they go mainstream</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-spotify-green mt-1">•</span>
                <span>Share your watchlist with potential employers to prove your industry knowledge</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-spotify-green mt-1">•</span>
                <span>Learn from what other aspiring professionals are watching</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="w-6 h-6 text-spotify-green" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">For Industry Professionals</h3>
            </div>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-spotify-green mt-1">•</span>
                <span>Discover emerging artists through data-driven momentum analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-spotify-green mt-1">•</span>
                <span>See what the collective A&R community is watching</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-spotify-green mt-1">•</span>
                <span>Identify talent scouts with proven track records</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-spotify-green mt-1">•</span>
                <span>Collaborate with peers to validate your discoveries</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Key Features */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-6 h-6 text-spotify-green" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">How It Works</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-spotify-green/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-spotify-green" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Momentum Tracking</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Our algorithm analyzes Spotify popularity, follower growth, and social media metrics to identify artists on the rise
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-spotify-green/10 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-spotify-green" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Community Discovery</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  See what other users are watching, follow tastemakers, and build your reputation as a talent scout
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-spotify-green/10 rounded-full flex items-center justify-center">
                  <Music className="w-5 h-5 text-spotify-green" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Genre Intelligence</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Filter by genre to specialize in specific sounds and identify micro-trends before they explode
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-spotify-green/10 rounded-full flex items-center justify-center">
                  <Globe className="w-5 h-5 text-spotify-green" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Social Integration</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Track Instagram, TikTok, and YouTube growth alongside streaming data for a complete picture
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Vision */}
        <div className="bg-gradient-to-r from-spotify-green/10 to-spotify-green/5 dark:from-spotify-green/20 dark:to-spotify-green/10 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Our Vision</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            We envision a future where A&R is no longer a black box, but a transparent, collaborative process. 
            Where students can prove their talent-spotting abilities with data. Where industry professionals 
            can tap into the collective intelligence of thousands of music enthusiasts. Where great artists 
            get discovered faster because more eyes and ears are on the hunt.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Music Monitor isn't just a tool—it's a movement to make the music industry more meritocratic, 
            more diverse, and more exciting. By working together, we can ensure that no great artist goes 
            unnoticed and that the next generation of A&R professionals has the tools they need to succeed.
          </p>
        </div>

        {/* Exclusive Access Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-spotify-green" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Exclusive Industry Access</h2>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Music Monitor maintains its quality and focus by limiting access to verified music industry 
            professionals and students. This ensures meaningful connections and serious talent discovery.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Automatic Approval</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-spotify-green">✓</span>
                  <span>Students at Berklee, NYU, UCLA</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-spotify-green">✓</span>
                  <span>{totalDomains}+ pre-approved domains</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-spotify-green">✓</span>
                  <span>More schools added by request</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Request Access</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Students & industry professionals can request access:
              </p>
              <a 
                href="mailto:indy@sagerock.com?subject=Music Monitor Access Request&body=Please include:%0A- Your name%0A- Company/School%0A- Your role%0A- LinkedIn profile"
                className="inline-flex items-center gap-2 text-spotify-green hover:underline text-sm font-medium"
              >
                <Mail className="w-4 h-4" />
                indy@sagerock.com
              </a>
            </div>
          </div>

          {/* Domain Lists */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <button
              onClick={() => setShowAllDomains(!showAllDomains)}
              className="text-sm font-medium text-spotify-green hover:text-spotify-green/80 mb-4"
            >
              {showAllDomains ? 'Hide' : 'Show'} Approved Domains ({totalDomains}+)
            </button>
            
            {showAllDomains ? (
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6 text-sm">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Music Schools</h4>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-3">
                      {ALLOWED_DOMAINS.educational.map(domain => (
                        <div key={domain} className="text-gray-600 dark:text-gray-400 py-0.5">
                          {domain}
                        </div>
                      ))}
                      <div className="text-spotify-green text-xs mt-2 italic">
                        Students: Email to add your school!
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Record Labels</h4>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 max-h-48 overflow-y-auto">
                      {ALLOWED_DOMAINS.recordLabels.map(domain => (
                        <div key={domain} className="text-gray-600 dark:text-gray-400 py-0.5">
                          {domain}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Music Industry</h4>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 max-h-48 overflow-y-auto">
                      {ALLOWED_DOMAINS.musicIndustry.map(domain => (
                        <div key={domain} className="text-gray-600 dark:text-gray-400 py-0.5">
                          {domain}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p className="mb-2">Examples of approved domains:</p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <span className="font-medium">Schools:</span> berklee.edu, nyu.edu, ucla.edu
                  </div>
                  <div>
                    <span className="font-medium">Labels:</span> {sampleLabels.slice(0, 3).join(', ')}...
                  </div>
                  <div>
                    <span className="font-medium">Industry:</span> {sampleIndustry.slice(0, 3).join(', ')}...
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Join the Community
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Whether you're a student looking to break into the industry or a professional seeking the next big thing, 
            Music Monitor is your platform for discovery.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="px-6 py-3 bg-spotify-green text-white font-medium rounded-full hover:bg-spotify-green/90 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/"
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Explore Artists
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-gray-500 dark:text-gray-400">
          <p>Built with ❤️ by Sage & Indy for the music community</p>
          <p className="mt-2">© 2024 Music Monitor. Empowering A&R discovery.</p>
        </div>
      </main>
    </div>
  );
}