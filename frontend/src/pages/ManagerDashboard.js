import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { jobAPI } from '@/services/api';
import { Plus, Briefcase, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await jobAPI.getAll();
      setJobs(response.data);
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: jobs.length,
    pending: jobs.filter(j => j.status === 'pending' || j.status === 'in_progress').length,
    completed: jobs.filter(j => j.status === 'completed' || j.status === 'delivered').length,
    totalRevenue: jobs.reduce((sum, j) => sum + j.estimated_amount, 0)
  };

  if (loading) {
    return <div className="text-center py-12" data-testid="loading">Loading dashboard...</div>;
  }

  return (
    <div data-testid="manager-dashboard">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">Your jobs overview</p>
        </div>
        <Button 
          onClick={() => navigate('/jobs/new')}
          className="bg-primary hover:bg-red-700 rounded-sm"
          data-testid="create-job-btn"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Job
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Jobs"
          value={stats.total}
          icon={<Briefcase className="w-6 h-6" />}
        />
        <StatCard
          title="Active Jobs"
          value={stats.pending}
          icon={<Clock className="w-6 h-6" />}
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={<CheckCircle className="w-6 h-6" />}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`}
          icon={<Briefcase className="w-6 h-6" />}
        />
      </div>

      {/* Recent Jobs */}
      <Card className="border-border" data-testid="recent-jobs-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold tracking-tight uppercase">Recent Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobs.slice(0, 5).map((job) => (
              <div 
                key={job.id} 
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/jobs/${job.id}`)}
                data-testid={`job-item-${job.id}`}
              >
                <div>
                  <p className="font-semibold">{job.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{job.vehicle_number} - {job.car_model}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold">₹{job.estimated_amount.toLocaleString('en-IN')}</p>
                  <span className={`status-badge status-${job.status}`}>{job.status.replace('_', ' ')}</span>
                </div>
              </div>
            ))}
            {jobs.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No jobs yet. Create your first job!</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const StatCard = ({ title, value, icon }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-border" data-testid="stat-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">{title}</p>
            <div className="text-primary">{icon}</div>
          </div>
          <p className="text-3xl font-black font-mono tracking-tight">{value}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ManagerDashboard;
