import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { jobAPI } from '@/services/api';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export const JobsList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  const fetchJobs = async () => {
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const response = await jobAPI.getAll(params);
      setJobs(response.data);
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.car_model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-12" data-testid="loading">Loading jobs...</div>;
  }

  return (
    <div data-testid="jobs-list-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">
            Jobs
          </h1>
          <p className="text-muted-foreground mt-2">{filteredJobs.length} total jobs</p>
        </div>
        {user?.role === 'manager' && (
          <Button 
            onClick={() => navigate('/jobs/new')}
            className="bg-primary hover:bg-red-700 rounded-sm"
            data-testid="new-job-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Job
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer, vehicle, or model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background border-input"
            data-testid="search-input"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="bg-background border-input" data-testid="status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="waiting_for_parts">Waiting for Parts</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="credit_pending">Credit Pending</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredJobs.map((job) => (
          <Card 
            key={job.id} 
            className="border-border hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => navigate(`/jobs/${job.id}`)}
            data-testid={`job-card-${job.id}`}
          >
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold">{job.customer_name}</h3>
                    <span className={`status-badge status-${job.status}`}>
                      {job.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    <span className="font-mono font-semibold">{job.vehicle_number}</span> - {job.car_model}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-1">{job.work_description}</p>
                  {user?.role === 'owner' && job.manager_name && (
                    <p className="text-xs text-muted-foreground mt-2">Manager: {job.manager_name}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">Estimated</p>
                  <p className="text-2xl font-black font-mono text-primary">
                    ₹{job.estimated_amount.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Paid: ₹{job.total_paid?.toLocaleString('en-IN') || 0}
                  </p>
                  {job.remaining_amount > 0 && (
                    <p className="text-xs text-yellow-500 mt-1">
                      Due: ₹{job.remaining_amount.toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredJobs.length === 0 && (
          <Card className="border-border">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No jobs found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default JobsList;
