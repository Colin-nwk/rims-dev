import React, { useState } from 'react';
import { useAuth, useApprovals, useNotifications, usePolicies, useToast } from '../App';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Modal, Input, TextArea } from '../components/ui/Components';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Clock, Calendar, FileText, CheckCircle, ArrowUpRight, ArrowRight, UploadCloud, UserCircle, Users, Download, Shield } from 'lucide-react';
import { Policy } from '../types';

const StatCard = ({ title, value, sub, icon: Icon, color = 'navy' }: any) => (
  <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
      <Icon className="w-24 h-24 transform rotate-12 -mr-4 -mt-4 text-navy-900 dark:text-white" />
    </div>
    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${color === 'gold' ? 'bg-gold-100 text-gold-600 dark:bg-gold-500/20 dark:text-gold-400' : 'bg-navy-50 text-navy-900 dark:bg-navy-700 dark:text-navy-200'}`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold text-navy-900 dark:text-white">{value}</span>
        {sub && <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center">{sub} <ArrowUpRight className="w-3 h-3 ml-0.5" /></span>}
      </div>
    </div>
  </Card>
);

const StaffDashboard = () => {
  const { user } = useAuth();
  const { addApproval } = useApprovals();
  const { notifications, markAllAsRead } = useNotifications();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaveData, setLeaveData] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  });

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      addApproval({
        type: 'Leave Request',
        user: user ? `${user.firstName} ${user.surname}` : 'Staff Member',
        detail: `${leaveData.reason} (${leaveData.startDate} to ${leaveData.endDate})`
      });

      setIsSubmitting(false);
      setIsLeaveModalOpen(false);
      setLeaveData({ startDate: '', endDate: '', reason: '' });
      toast('success', "Your leave request has been submitted to HR.", "Request Submitted");
    }, 1500);
  };

  const recentNotifications = notifications.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Leave Balance" value="12 Days" sub="Annual" icon={Calendar} color="navy" />
        <StatCard title="Pending Docs" value="1" sub="Action Required" icon={FileText} color="gold" />
        <StatCard title="Next Review" value="Nov 15" sub="In 2 months" icon={Clock} color="navy" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="text-xl font-medium text-navy-900 dark:text-white mb-6">Recent Activity</h3>
            <div className="space-y-6">
              {[
                { title: 'Leave Request Approved', date: 'Today', icon: CheckCircle, color: 'text-emerald-500' },
                { title: 'Uploaded ID Document', date: 'Yesterday', icon: FileText, color: 'text-blue-500 dark:text-blue-400' },
                { title: 'Profile Updated', date: '3 days ago', icon: Clock, color: 'text-slate-400' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className={`mt-1 ${item.color}`}><item.icon className="w-5 h-5" /></div>
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{item.title}</p>
                    <p className="text-sm text-slate-400">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-6 text-navy-900 dark:text-slate-200">View All Activity</Button>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium text-navy-900 dark:text-white">Notifications</h3>
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>Mark all read</Button>
            </div>
            <div className="space-y-4">
              {recentNotifications.length > 0 ? (
                recentNotifications.map(notif => (
                  <div key={notif.id} className={`p-4 rounded-lg border ${notif.read ? 'bg-white dark:bg-navy-900 border-slate-100 dark:border-navy-700' : 'bg-blue-50/50 dark:bg-navy-800 border-blue-100 dark:border-navy-600'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-sm font-semibold ${notif.read ? 'text-slate-700 dark:text-slate-300' : 'text-navy-900 dark:text-white'}`}>{notif.title}</span>
                      <span className="text-xs text-slate-400">{notif.date}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{notif.message}</p>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-400 py-4">No new notifications</div>
              )}
            </div>
          </Card>
        </div>

        <div>
           <Card>
              <h3 className="text-xl font-medium text-navy-900 dark:text-white mb-6">Quick Actions</h3>
              <div className="space-y-3">
                <Button onClick={() => setIsLeaveModalOpen(true)} className="w-full justify-between group">
                  <span>Request Leave</span>
                  <Calendar className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" onClick={() => navigate('/documents')} className="w-full justify-between group">
                  <span>Upload Document</span>
                  <UploadCloud className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" onClick={() => navigate('/profile')} className="w-full justify-between group">
                  <span>Edit Profile</span>
                  <UserCircle className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
           </Card>
        </div>
      </div>

      <Modal 
        isOpen={isLeaveModalOpen} 
        onClose={() => setIsLeaveModalOpen(false)} 
        title="Submit Leave Request"
      >
        <form onSubmit={handleLeaveSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Start Date" 
              type="date" 
              required 
              value={leaveData.startDate}
              onChange={e => setLeaveData({...leaveData, startDate: e.target.value})}
            />
            <Input 
              label="End Date" 
              type="date" 
              required 
              value={leaveData.endDate}
              onChange={e => setLeaveData({...leaveData, endDate: e.target.value})}
            />
          </div>
          <TextArea 
            label="Reason" 
            placeholder="Please describe the reason for your leave..."
            rows={4}
            required
            value={leaveData.reason}
            onChange={e => setLeaveData({...leaveData, reason: e.target.value})}
          />
          <div className="flex justify-end gap-3 pt-2">
             <Button type="button" variant="ghost" onClick={() => setIsLeaveModalOpen(false)}>Cancel</Button>
             <Button type="submit" isLoading={isSubmitting}>Submit Request</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const HRDashboard = () => {
  const { user } = useAuth();
  const { approvals } = useApprovals();
  const { addNotification } = useNotifications();
  const { addPolicy } = usePolicies();
  const { toast } = useToast();
  const navigate = useNavigate();
  const pendingCount = approvals.filter(a => a.status === 'pending').length;

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Report State
  const [reportConfig, setReportConfig] = useState({ type: 'Attendance', range: 'This Month', format: 'PDF' });
  // Policy State
  const [policyConfig, setPolicyConfig] = useState({ title: '', content: '' });

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsReportModalOpen(false);
      toast('success', `${reportConfig.type} Report (${reportConfig.range}) generated successfully.`, "Report Ready");
    }, 2000);
  };

  const handleUpdatePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsProcessing(true);
    
    setTimeout(() => {
      // Add policy to context
      const newPolicy: Policy = {
          id: `p${Date.now()}`,
          title: policyConfig.title,
          content: policyConfig.content,
          version: '1.0',
          dateUpdated: new Date().toISOString().split('T')[0],
          category: 'General', // Defaulting for simplicity
          uploadedBy: `${user.firstName} ${user.surname}`
      };
      addPolicy(newPolicy);

      setIsProcessing(false);
      setIsPolicyModalOpen(false);
      addNotification({
        title: 'Policy Updated',
        message: `New policy: "${policyConfig.title}" has been published.`,
        type: 'info',
        targetRole: 'all'
      });
      setPolicyConfig({ title: '', content: '' });
      toast('success', "New policy published to all staff.", "Policy Updated");
    }, 1500);
  };

  const data = [
    { name: 'Mon', active: 40, leave: 2 },
    { name: 'Tue', active: 38, leave: 4 },
    { name: 'Wed', active: 41, leave: 1 },
    { name: 'Thu', active: 39, leave: 3 },
    { name: 'Fri', active: 35, leave: 7 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Staff" value="142" sub="+12% this month" icon={Users} color="navy" />
        <StatCard title="On Leave" value="8" sub="Today" icon={Calendar} color="gold" />
        <StatCard title="Pending Approvals" value={pendingCount} sub="Urgent" icon={CheckCircle} color="navy" />
        <StatCard title="Open Roles" value="3" sub="Hiring" icon={FileText} color="navy" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="text-xl font-medium text-navy-900 dark:text-white mb-6">Staff Attendance Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="active" fill="#0f172a" radius={[4, 4, 0, 0]} barSize={40} className="dark:fill-slate-200" />
                <Bar dataKey="leave" fill="#fbbf24" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-medium text-navy-900 dark:text-white mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <Button variant="primary" className="w-full justify-between group" onClick={() => navigate('/approvals')}>
              <span>Approve Leave Requests</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" className="w-full justify-between group" onClick={() => navigate('/staff')}>
              <span>Add New Staff</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" className="w-full justify-between group" onClick={() => setIsReportModalOpen(true)}>
              <span>Generate Report</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" className="w-full justify-between group" onClick={() => setIsPolicyModalOpen(true)}>
              <span>Update Policies</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Generate Report Modal */}
      <Modal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        title="Generate HR Report"
      >
        <form onSubmit={handleGenerateReport} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Report Type</label>
            <select 
              className="w-full h-10 rounded-md border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-navy-900 dark:focus:ring-gold-500"
              value={reportConfig.type}
              onChange={(e) => setReportConfig({...reportConfig, type: e.target.value})}
            >
              <option value="Attendance">Attendance Report</option>
              <option value="Payroll">Payroll Summary</option>
              <option value="Performance">Staff Performance</option>
              <option value="Leave">Leave Balance & Usage</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Date Range</label>
            <select 
              className="w-full h-10 rounded-md border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-navy-900 dark:focus:ring-gold-500"
              value={reportConfig.range}
              onChange={(e) => setReportConfig({...reportConfig, range: e.target.value})}
            >
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="Last Month">Last Month</option>
              <option value="Year to Date">Year to Date</option>
              <option value="Custom">Custom Range</option>
            </select>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Format</label>
             <div className="flex gap-4">
               {['PDF', 'Excel', 'CSV'].map(fmt => (
                 <label key={fmt} className="flex items-center cursor-pointer">
                   <input 
                      type="radio" 
                      name="format" 
                      value={fmt}
                      checked={reportConfig.format === fmt} 
                      onChange={() => setReportConfig({...reportConfig, format: fmt})}
                      className="mr-2 text-navy-900 focus:ring-navy-900" 
                    />
                   <span className="text-sm text-slate-700 dark:text-slate-300">{fmt}</span>
                 </label>
               ))}
             </div>
          </div>

          <div className="bg-blue-50 dark:bg-navy-800 p-3 rounded-lg flex items-start gap-3">
             <Download className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
             <div>
               <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Ready to export</p>
               <p className="text-xs text-blue-700 dark:text-blue-300">The report will be downloaded to your device automatically upon generation.</p>
             </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-navy-700">
             <Button type="button" variant="ghost" onClick={() => setIsReportModalOpen(false)}>Cancel</Button>
             <Button type="submit" isLoading={isProcessing}>Generate Report</Button>
          </div>
        </form>
      </Modal>

      {/* Update Policy Modal */}
      <Modal 
        isOpen={isPolicyModalOpen} 
        onClose={() => setIsPolicyModalOpen(false)} 
        title="Update Company Policies"
      >
        <form onSubmit={handleUpdatePolicy} className="space-y-4">
          <Input 
            label="Policy Title" 
            placeholder="e.g. Remote Work Guidelines 2024" 
            required
            value={policyConfig.title}
            onChange={(e) => setPolicyConfig({...policyConfig, title: e.target.value})}
          />
          
          <TextArea 
            label="Policy Summary / Change Log"
            placeholder="Briefly describe the changes or paste the policy content here..."
            rows={4}
            required
            value={policyConfig.content}
            onChange={(e) => setPolicyConfig({...policyConfig, content: e.target.value})}
          />

          <div className="border-2 border-dashed border-slate-300 dark:border-navy-600 rounded-lg p-6 text-center hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors cursor-pointer">
             <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
             <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Upload Policy Document (PDF)</p>
             <p className="text-xs text-slate-400 mt-1">Optional. Max 5MB.</p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg flex items-start gap-3">
             <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
             <div>
               <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Staff Notification</p>
               <p className="text-xs text-amber-700 dark:text-amber-300">All active staff members will receive a notification about this policy update.</p>
             </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-navy-700">
             <Button type="button" variant="ghost" onClick={() => setIsPolicyModalOpen(false)}>Cancel</Button>
             <Button type="submit" isLoading={isProcessing}>Publish Update</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const AdminDashboard = () => (
  <div className="space-y-6">
     <div className="bg-navy-900 dark:bg-navy-800 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-medium mb-2">System Status: Healthy</h2>
            <p className="text-slate-400">All services operational. Last backup: 2 hours ago.</p>
          </div>
          <Button variant="secondary" size="sm">Run Diagnostics</Button>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
           <svg width="300" height="200" viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 100 Q 75 50, 150 100 T 300 100" stroke="white" strokeWidth="20" fill="none" />
           </svg>
        </div>
     </div>

     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Active Users" value="156" sub="Total" icon={Users} color="navy" />
        <StatCard title="System Load" value="24%" sub="Low" icon={Clock} color="gold" />
        <StatCard title="Audit Logs" value="2.4k" sub="+120 today" icon={FileText} color="navy" />
     </div>

     <Card>
       <h3 className="text-xl font-medium text-navy-900 dark:text-white mb-6">User Access Logs</h3>
       <div className="overflow-x-auto">
         <table className="w-full text-left text-sm">
           <thead>
             <tr className="border-b border-slate-200 dark:border-navy-700 text-slate-500 dark:text-slate-400">
               <th className="pb-3 font-medium">User</th>
               <th className="pb-3 font-medium">Action</th>
               <th className="pb-3 font-medium">IP Address</th>
               <th className="pb-3 font-medium">Time</th>
               <th className="pb-3 font-medium">Status</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100 dark:divide-navy-700">
             {[
               { u: 'Sarah Chen', a: 'Login', ip: '192.168.1.1', t: '2 mins ago', s: 'Success' },
               { u: 'Marcus Reynolds', a: 'Update Profile', ip: '192.168.1.4', t: '15 mins ago', s: 'Success' },
               { u: 'System', a: 'Backup', ip: 'localhost', t: '2 hours ago', s: 'Success' },
               { u: 'John Doe', a: 'Failed Login', ip: '10.0.0.5', t: '3 hours ago', s: 'Failed' },
             ].map((log, i) => (
               <tr key={i} className="group hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors">
                 <td className="py-3 font-medium text-navy-900 dark:text-slate-200">{log.u}</td>
                 <td className="py-3 text-slate-600 dark:text-slate-400">{log.a}</td>
                 <td className="py-3 text-slate-500 font-mono text-xs">{log.ip}</td>
                 <td className="py-3 text-slate-500">{log.t}</td>
                 <td className="py-3">
                   <Badge variant={log.s === 'Success' ? 'success' : 'error'}>{log.s}</Badge>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
     </Card>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-medium text-navy-900 dark:text-white">Dashboard</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome back, {user.firstName}. Here's what's happening today.</p>
      </div>
      
      {user.role === 'staff' && <StaffDashboard />}
      {user.role === 'hr' && <HRDashboard />}
      {user.role === 'admin' && <AdminDashboard />}
    </div>
  );
};

export default Dashboard;