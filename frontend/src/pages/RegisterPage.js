import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Wrench } from 'lucide-react';
import { toast } from 'sonner';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'owner',
    invite_code: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const user = await register(formData);
      toast.success('Registration successful!');
      
      if (user.role === 'owner') {
        navigate('/workshop-setup');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" 
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1619505372149-07875c35b313?crop=entropy&cs=srgb&fm=jpg&q=85')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-background/90" />
      
      <Card className="w-full max-w-md relative z-10 border-border" data-testid="register-card">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Wrench className="w-8 h-8 text-primary" />
            <CardTitle className="text-3xl font-black tracking-tighter uppercase">RevOps</CardTitle>
          </div>
          <CardDescription className="text-center">Create your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>I am a</Label>
              <RadioGroup 
                value={formData.role} 
                onValueChange={(value) => setFormData({ ...formData, role: value })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="owner" id="owner" data-testid="role-owner" />
                  <Label htmlFor="owner" className="cursor-pointer">Workshop Owner</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="manager" id="manager" data-testid="role-manager" />
                  <Label htmlFor="manager" className="cursor-pointer">Manager</Label>
                </div>
              </RadioGroup>
            </div>

            {formData.role === 'manager' && (
              <div className="space-y-2">
                <Label htmlFor="invite_code">Invite Code</Label>
                <Input
                  id="invite_code"
                  type="text"
                  placeholder="Enter invite code from owner"
                  value={formData.invite_code}
                  onChange={(e) => setFormData({ ...formData, invite_code: e.target.value.toUpperCase() })}
                  required
                  className="bg-background border-input focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                  data-testid="invite-code-input"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-background border-input focus:ring-2 focus:ring-primary focus:border-transparent"
                data-testid="name-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-background border-input focus:ring-2 focus:ring-primary focus:border-transparent"
                data-testid="email-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="bg-background border-input focus:ring-2 focus:ring-primary focus:border-transparent"
                data-testid="phone-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="bg-background border-input focus:ring-2 focus:ring-primary focus:border-transparent"
                data-testid="password-input"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary text-primary-foreground hover:bg-red-700 rounded-sm"
              disabled={loading}
              data-testid="register-submit-btn"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="text-primary hover:underline" data-testid="login-link">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
