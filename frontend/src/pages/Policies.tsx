import React, { useState } from 'react';
import { Card, Button, Input, Select, Badge, Modal, RichTextEditor } from '../components/ui/Components';
import { usePolicies, useAuth, useToast } from '../App';
import { BookOpen, Search, Shield, HardDrive, Download, Calendar, User, Eye, FileText, ArrowRight, Plus, MoreVertical, Edit2, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Policy } from '../types';

const Policies = () => {
  const { policies, addPolicy, updatePolicy, deletePolicy } = usePolicies();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);

  // Dropdown State
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General' as 'HR' | 'IT' | 'General' | 'Safety',
    version: '1.0'
  });

  const canManage = user?.role === 'hr' || user?.role === 'admin';

  // Helper to strip HTML tags for card preview
  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Filter and sort policies
  const filteredPolicies = policies.filter(policy => {
    const cleanContent = stripHtml(policy.content).toLowerCase();
    const matchesSearch = policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cleanContent.includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || policy.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => new Date(b.dateUpdated).getTime() - new Date(a.dateUpdated).getTime());

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'IT': return <HardDrive className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'HR': return <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'Safety': return <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />;
      default: return <BookOpen className="w-5 h-5 text-gold-600 dark:text-gold-400" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'IT': return 'bg-blue-50 dark:bg-blue-900/20';
      case 'HR': return 'bg-purple-50 dark:bg-purple-900/20';
      case 'Safety': return 'bg-red-50 dark:bg-red-900/20';
      default: return 'bg-gold-50 dark:bg-gold-900/20';
    }
  };

  // --- Handlers ---

  const handleOpenAdd = () => {
    setEditingPolicy(null);
    setFormData({ title: '', content: '', category: 'General', version: '1.0' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, policy: Policy) => {
    e.stopPropagation(); // Prevent card click
    setEditingPolicy(policy);
    setFormData({
      title: policy.title,
      content: policy.content,
      category: policy.category,
      version: policy.version
    });
    setOpenDropdownId(null);
    setIsModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent card click
    if (window.confirm("Are you sure you want to delete this policy?")) {
      deletePolicy(id);
      toast('success', 'Policy deleted successfully.');
      setOpenDropdownId(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    setTimeout(() => {
      if (editingPolicy) {
        // Update
        const updated: Policy = {
          ...editingPolicy,
          title: formData.title,
          content: formData.content,
          category: formData.category,
          version: formData.version,
          dateUpdated: new Date().toISOString().split('T')[0],
          uploadedBy: `${user.firstName} ${user.surname}`
        };
        updatePolicy(updated);
        toast('success', 'Policy updated successfully.');
      } else {
        // Create
        const newPolicy: Policy = {
          id: `p${Date.now()}`,
          title: formData.title,
          content: formData.content,
          category: formData.category,
          version: formData.version,
          dateUpdated: new Date().toISOString().split('T')[0],
          uploadedBy: `${user.firstName} ${user.surname}`
        };
        addPolicy(newPolicy);
        toast('success', 'New policy created successfully.');
      }
      setIsSubmitting(false);
      setIsModalOpen(false);
    }, 800);
  };

  // Close dropdowns on click outside
  React.useEffect(() => {
    const handleClick = () => setOpenDropdownId(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-medium text-navy-900 dark:text-white">Company Policies</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Access the latest guidelines, handbooks, and procedures</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Input
              placeholder="Search policies..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="General">General</option>
              <option value="HR">Human Resources</option>
              <option value="IT">IT & Security</option>
              <option value="Safety">Safety</option>
            </Select>
          </div>
          {canManage && (
            <Button onClick={handleOpenAdd}>
              <Plus className="w-4 h-4 mr-2" /> Add Policy
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPolicies.map(policy => (
          <Card
            key={policy.id}
            className="flex flex-col h-full hover:shadow-lg transition-all duration-300 cursor-pointer group border-l-4 border-l-transparent hover:border-l-gold-500 relative"
            onClick={() => navigate(`/policies/${policy.id}`)}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg ${getCategoryColor(policy.category)}`}>
                {getCategoryIcon(policy.category)}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">v{policy.version}</Badge>
                {canManage && (
                  <div className="relative">
                    <button
                      className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-navy-700 text-slate-400 hover:text-navy-900 dark:hover:text-white transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(openDropdownId === policy.id ? null : policy.id);
                      }}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {openDropdownId === policy.id && (
                      <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-navy-800 rounded-md shadow-xl border border-slate-200 dark:border-navy-700 z-10 animate-in fade-in zoom-in-95 duration-200">
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-700 flex items-center gap-2"
                          onClick={(e) => handleOpenEdit(e, policy)}
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                          onClick={(e) => handleDelete(e, policy.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <h3 className="text-lg font-medium text-navy-900 dark:text-white mb-2 line-clamp-2 group-hover:text-gold-600 dark:group-hover:text-gold-500 transition-colors">
              {policy.title}
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 flex-1 line-clamp-3 leading-relaxed">
              {stripHtml(policy.content)}
            </p>

            <div className="pt-4 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between mt-auto">
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {policy.dateUpdated}
              </div>
              <span className="text-sm font-medium text-gold-600 dark:text-gold-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Read Policy <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </Card>
        ))}
      </div>

      {filteredPolicies.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-navy-900 rounded-xl border border-dashed border-slate-200 dark:border-navy-700">
          <div className="w-16 h-16 bg-slate-50 dark:bg-navy-800 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="text-lg font-medium text-navy-900 dark:text-white">No policies found</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-xs text-center">We couldn't find any policies matching your search criteria.</p>
          <Button variant="outline" className="mt-4" onClick={() => { setSearchTerm(''); setCategoryFilter('All'); }}>
            Clear Filters
          </Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPolicy ? 'Edit Policy' : 'Create New Policy'}
        className="max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Policy Title"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="e.g. Remote Work Policy"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
              <select
                className="flex h-10 w-full rounded-md border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-950 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-navy-900 dark:focus:ring-gold-500"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as any })}
              >
                <option value="General">General</option>
                <option value="HR">Human Resources</option>
                <option value="IT">IT & Security</option>
                <option value="Safety">Safety</option>
              </select>
            </div>
            <Input
              label="Version"
              value={formData.version}
              onChange={e => setFormData({ ...formData, version: e.target.value })}
              required
              placeholder="e.g. 1.0"
            />
          </div>

          <RichTextEditor
            label="Policy Content"
            value={formData.content}
            onChange={(val) => setFormData({ ...formData, content: val })}
            placeholder="Enter the main details of the policy here..."
          />

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-navy-700">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>{editingPolicy ? 'Save Changes' : 'Create Policy'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Policies;