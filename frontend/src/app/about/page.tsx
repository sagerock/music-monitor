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
            About A&R Club
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Empowering music industry students to discover rising talent together
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-6 h-6 text-spotify-green" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Our Mission</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            A&R Club empowers music industry students to develop real-world A&R skills through hands-on talent discovery.
            We believe that learning to scout talent shouldn't wait until you land your first job—it should start now,
            with your peers, using the same data-driven tools that professionals use. By fostering a collaborative
            community of student talent scouts, we're helping you build the portfolio and instincts you need to break
            into the music industry.
          </p>
        </div>

        {/* What You Can Do */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <GraduationCap className="w-6 h-6 text-spotify-green" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">What You Can Do</h2>
          </div>
          <ul className="space-y-4 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-spotify-green mt-1 text-xl">•</span>
              <div>
                <strong>Build Your A&R Portfolio:</strong> Track emerging artists and showcase your ability to spot talent early
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-spotify-green mt-1 text-xl">•</span>
              <div>
                <strong>Prove Your Instincts:</strong> Demonstrate your trend-spotting skills with data that shows you found artists before they went mainstream
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-spotify-green mt-1 text-xl">•</span>
              <div>
                <strong>Stand Out to Employers:</strong> Share your curated watchlist and activity history with potential employers during interviews
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-spotify-green mt-1 text-xl">•</span>
              <div>
                <strong>Learn from Your Peers:</strong> See what other music industry students are discovering and exchange insights with future A&R professionals
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-spotify-green mt-1 text-xl">•</span>
              <div>
                <strong>Connect & Collaborate:</strong> Follow classmates, share discoveries, and build relationships that will last throughout your career
              </div>
            </li>
          </ul>
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
            We believe that music industry students deserve more than just lectures and case studies—you deserve
            hands-on experience discovering the next generation of artists. A&R Club gives you the platform to
            build a real track record of talent discovery that you can show to potential employers.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            This isn't just a tool—it's your launching pad into the music industry. Whether you're studying
            music business, production, or any related field, A&R Club helps you develop the skills, network,
            and portfolio that will set you apart when you're ready to start your career. Together, we're
            building the next generation of music industry leaders.
          </p>
        </div>

        {/* Exclusive Access Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-spotify-green" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Exclusive Industry Access</h2>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            A&R Club is exclusively for music industry students and recent graduates. By limiting access
            to verified students, we maintain a collaborative learning environment where everyone is
            building their skills together.
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
                Students at other schools can request access:
              </p>
              <a
                href="mailto:indy@sagerock.com?subject=A&R Club Student Access Request&body=Please include:%0A- Your name%0A- School name%0A- Your program/major%0A- Expected graduation year"
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
            Start Building Your A&R Portfolio
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Join hundreds of music industry students discovering the next generation of artists.
            Start tracking emerging talent today and build the portfolio that will launch your career.
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
          <p>Built with ❤️ for the music industry student community</p>
          <p className="mt-2">© 2024 A&R Club. Empowering the next generation of A&R professionals.</p>
        </div>
      </main>
    </div>
  );
}