import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Wrench, BarChart3, Users, FileText, Shield, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 z-0 opacity-30"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1675034743126-0f250a5fee51?crop=entropy&cs=srgb&fm=jpg&q=85')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background z-0" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <Wrench className="w-12 h-12 text-primary" strokeWidth={2} />
              <h1 className="text-6xl md:text-7xl font-black tracking-tighter uppercase text-foreground">
                RevOps
              </h1>
            </div>
            
            <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-3xl mx-auto mb-12">
              Complete Garage Management System - Control Your Operations, Eliminate Money Leakage, Scale with Confidence
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button 
                  size="lg" 
                  className="rounded-sm text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-red-700 shadow-[0_0_20px_rgba(220,38,38,0.5)]"
                  data-testid="get-started-btn"
                >
                  Get Started
                </Button>
              </Link>
              <Link to="/login">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="rounded-sm text-lg px-8 py-6"
                  data-testid="sign-in-btn"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight uppercase text-center mb-16">
          Built for Workshop Owners
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8" />}
            title="REAL-TIME ANALYTICS"
            description="Track revenue, manager performance, and trends with powerful data analytics engine"
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8" />}
            title="FULL TRANSPARENCY"
            description="Owner confirms every payment. No money leakage. Complete visibility into operations"
          />
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="MULTI-MANAGER"
            description="Scale to 50+ managers with invite-based onboarding and permission controls"
          />
          <FeatureCard
            icon={<FileText className="w-8 h-8" />}
            title="DOCUMENTS"
            description="Generate professional job cards and invoices with GST support instantly"
          />
          <FeatureCard
            icon={<TrendingUp className="w-8 h-8" />}
            title="TREND FORECASTING"
            description="Built-in analytics for revenue forecasting, credit risk detection, and efficiency scoring"
          />
          <FeatureCard
            icon={<Wrench className="w-8 h-8" />}
            title="JOB TRACKING"
            description="Complete job lifecycle from intake to delivery with status updates and payment tracking"
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-card border-t border-border py-24">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight uppercase mb-6">
            Ready to Transform Your Workshop?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join workshop owners who have eliminated money leakage and gained complete operational control
          </p>
          <Link to="/register">
            <Button 
              size="lg" 
              className="rounded-sm text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-red-700"
              data-testid="bottom-cta-btn"
            >
              Start Free Trial
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      viewport={{ once: true }}
      className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors duration-300"
      data-testid="feature-card"
    >
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-xl font-bold tracking-tight mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
};

export default LandingPage;
