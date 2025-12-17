import React, { useState, useRef } from 'react';
import { useAuth, useToast } from '../App';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Button, Badge, Modal, Stepper, Select } from '../components/ui/Components';
import { 
  User as UserIcon, Mail, Phone, MapPin, Briefcase, Calendar, Edit2, Save, X, 
  FileText, CreditCard, Clock, Shield, Award, Building2, Wallet, 
  CheckCircle, AlertCircle, Camera, Hash, Globe, ChevronRight, ChevronLeft, Heart, UploadCloud
} from 'lucide-react';
import IDCardModal from '../components/IDCardModal';

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // State
  const [activeTab, setActiveTab] = useState<'overview' | 'personal' | 'employment' | 'banking'>('overview');
  const [isIDModalOpen, setIsIDModalOpen] = useState(false);
  
  // Avatar State
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Wizard State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Profile Data State (Combines User context and local mock data)
  const [profileData, setProfileData] = useState({
    // Fields from User object that might be editable
    firstName: user?.firstName || '',
    surname: user?.surname || '',
    phone: user?.phone || '',
    
    // Additional fields
    address: '123 Innovation Dr, Suite 100',
    city: 'Abuja',
    state: 'FCT',
    nationality: 'Nigerian',
    dob: user?.dateOfBirth || '1990-05-15',
    gender: user?.gender || 'Male',
    maritalStatus: 'Married',
    bankName: 'First Bank of Nigeria',
    accountNumber: '3049218842',
    accountName: `${user?.firstName} ${user?.surname}`.toUpperCase()
  });

  // Edit Form State (Buffer for changes)
  const [editForm, setEditForm] = useState(profileData);

  const steps = [
    { id: 1, title: 'Identity' },
    { id: 2, title: 'Contact' },
    { id: 3, title: 'Banking' },
    { id: 4, title: 'Review' }
  ];

  if (!user) return null;

  // --- Handlers ---

  const handleOpenWizard = () => {
    setEditForm({ ...profileData });
    setCurrentStep(0);
    setIsWizardOpen(true);
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleWizardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would be an API call
    setProfileData(editForm);
    setIsWizardOpen(false);
    toast('success', "Profile updated successfully.", "Changes Saved");
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
        toast('success', 'Profile picture updated successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const getServiceDuration = (dateString: string) => {
    const start = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
    const months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
    
    if (years > 0) return `${years} Years, ${months} Months`;
    return `${months} Months`;
  };

  // --- Components ---

  const InfoRow = ({ icon: Icon, label, value, className }: any) => (
    <div className={`flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-800/50 transition-colors ${className}`}>
      <div className="mt-0.5 text-slate-400 dark:text-slate-500">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm font-medium text-navy-900 dark:text-white truncate">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-8">
      
      {/* --- Hero Section --- */}
      <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-navy-900 shadow-xs border border-slate-200 dark:border-navy-800">
        {/* Banner */}
        <div className="h-48 bg-linear-to-r from-navy-900 via-navy-800 to-emerald-900 dark:from-navy-950 dark:to-navy-900 relative">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            <div className="absolute bottom-4 right-4 flex gap-2">
                <Button 
                    variant="secondary" 
                    size="sm" 
                    className="backdrop-blur-md bg-white/10 hover:bg-white/20 text-white border-white/20"
                    onClick={() => setIsIDModalOpen(true)}
                >
                    <CreditCard className="w-4 h-4 mr-2" /> View ID Card
                </Button>
            </div>
        </div>

        {/* Profile Info */}
        <div className="px-8 pb-8 flex flex-col md:flex-row gap-6 items-start">
            <div className="relative -mt-16">
                <div className="w-32 h-32 rounded-2xl border-4 border-white dark:border-navy-900 shadow-xl bg-white dark:bg-navy-800 overflow-hidden relative group">
                    <img 
                        src={avatarUrl || user.avatarUrl} 
                        alt="Profile" 
                        className="w-full h-full object-cover" 
                    />
                    <div 
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                        onClick={handleAvatarClick}
                    >
                        <Camera className="w-8 h-8 text-white" />
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>
                </div>
                <div className={`absolute bottom-2 -right-2 w-6 h-6 rounded-full border-4 border-white dark:border-navy-900 ${user.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
            </div>

            <div className="flex-1 mt-4 md:mt-0 pt-2">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-navy-900 dark:text-white flex items-center gap-3">
                            {user.firstName} {user.surname}
                            <Badge variant={user.status === 'active' ? 'success' : 'warning'} className="text-xs align-middle">
                                {user.status}
                            </Badge>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2 mt-1">
                            <Briefcase className="w-4 h-4" /> {user.presentRank} 
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                            {user.department}
                        </p>
                    </div>
                    
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={handleOpenWizard}>
                            <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                        </Button>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* --- Main Content Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3 space-y-6">
              <nav className="flex flex-col space-y-1">
                 {[
                   { id: 'overview', label: 'Overview', icon: UserIcon },
                   { id: 'personal', label: 'Personal Info', icon: FileText },
                   { id: 'employment', label: 'Employment', icon: Briefcase },
                   { id: 'banking', label: 'Banking & Tax', icon: Wallet },
                 ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`
                            flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                            ${activeTab === item.id 
                                ? 'bg-navy-900 text-white shadow-md dark:bg-gold-500 dark:text-navy-900' 
                                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-navy-800'
                            }
                        `}
                    >
                        <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-gold-500 dark:text-navy-900' : 'text-slate-400'}`} />
                        {item.label}
                    </button>
                 ))}
              </nav>

              {/* Quick Contact Card */}
              <Card className="bg-linear-to-br from-slate-50 to-white dark:from-navy-900 dark:to-navy-800">
                  <h3 className="font-medium text-navy-900 dark:text-white mb-4">Contact</h3>
                  <div className="space-y-4">
                      <div className="flex items-start gap-3">
                          <Mail className="w-4 h-4 text-slate-400 mt-1" />
                          <div>
                              <p className="text-xs text-slate-500 uppercase font-bold">Work Email</p>
                              <p className="text-sm font-medium text-navy-900 dark:text-white break-all">{user.email}</p>
                          </div>
                      </div>
                      <div className="flex items-start gap-3">
                          <Phone className="w-4 h-4 text-slate-400 mt-1" />
                          <div>
                              <p className="text-xs text-slate-500 uppercase font-bold">Mobile</p>
                              <p className="text-sm font-medium text-navy-900 dark:text-white">{profileData.phone || 'Not set'}</p>
                          </div>
                      </div>
                      <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-slate-400 mt-1" />
                          <div>
                              <p className="text-xs text-slate-500 uppercase font-bold">Location</p>
                              <p className="text-sm font-medium text-navy-900 dark:text-white">{user.location || 'HQ, Abuja'}</p>
                          </div>
                      </div>
                  </div>
              </Card>
          </div>

          {/* Tab Content */}
          <div className="lg:col-span-9 space-y-6">
              
              {/* --- OVERVIEW TAB --- */}
              {activeTab === 'overview' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      {/* Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card className="flex items-center gap-4 bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30">
                              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                                  <Clock className="w-6 h-6" />
                              </div>
                              <div>
                                  <p className="text-xs font-bold text-emerald-600/70 dark:text-emerald-400/70 uppercase">Service Time</p>
                                  <p className="text-lg font-bold text-navy-900 dark:text-white">{getServiceDuration(user.joinDate)}</p>
                              </div>
                          </Card>
                          <Card className="flex items-center gap-4 bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
                              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                                  <Calendar className="w-6 h-6" />
                              </div>
                              <div>
                                  <p className="text-xs font-bold text-blue-600/70 dark:text-blue-400/70 uppercase">Leave Balance</p>
                                  <p className="text-lg font-bold text-navy-900 dark:text-white">12 Days</p>
                              </div>
                          </Card>
                          <Card className="flex items-center gap-4 bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30">
                              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
                                  <Award className="w-6 h-6" />
                              </div>
                              <div>
                                  <p className="text-xs font-bold text-amber-600/70 dark:text-amber-400/70 uppercase">Rating</p>
                                  <p className="text-lg font-bold text-navy-900 dark:text-white">Excellent</p>
                              </div>
                          </Card>
                      </div>

                      <Card>
                          <h3 className="font-medium text-lg text-navy-900 dark:text-white mb-4">About Me</h3>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                              Dedicated and results-oriented professional with over {getServiceDuration(user.joinDate).split(',')[0]} of experience in the {user.department} department. 
                              Committed to maintaining high standards of service and operational efficiency within the Nigerian Correctional Service. 
                              Skilled in team leadership, strategic planning, and crisis management.
                          </p>
                      </Card>
                  </div>
              )}

              {/* --- PERSONAL INFO TAB --- */}
              {activeTab === 'personal' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <Card>
                          <div className="flex justify-between items-center mb-6">
                             <h3 className="font-medium text-lg text-navy-900 dark:text-white">Personal Information</h3>
                             <Button size="sm" variant="ghost" onClick={handleOpenWizard}>
                                 <Edit2 className="w-4 h-4 mr-2" /> Edit Details
                             </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                              <div className="md:col-span-2 pb-2 mb-2 border-b border-slate-100 dark:border-navy-800">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Basic Details</h4>
                              </div>
                              <InfoRow icon={UserIcon} label="Full Name" value={`${user.firstName} ${user.surname}`} />
                              <InfoRow icon={Hash} label="Gender" value={user.gender || 'Not Set'} />
                              <InfoRow icon={Calendar} label="Date of Birth" value={profileData.dob} />
                              <InfoRow icon={Heart} label="Marital Status" value={profileData.maritalStatus} />
                              
                              <div className="md:col-span-2 pb-2 mb-2 mt-4 border-b border-slate-100 dark:border-navy-800">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Origin & Citizenship</h4>
                              </div>
                              <InfoRow icon={Globe} label="Nationality" value={profileData.nationality} />
                              <InfoRow icon={MapPin} label="State of Origin" value={user.stateOfOrigin || 'Not Set'} />
                              <InfoRow icon={MapPin} label="LGA" value={user.lga || 'Not Set'} />
                          </div>
                      </Card>

                      <Card>
                          <h3 className="font-medium text-lg text-navy-900 dark:text-white mb-6">Contact & Address</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                              <InfoRow icon={Phone} label="Phone Number" value={profileData.phone || 'Not Set'} />
                              <InfoRow icon={Mail} label="Email Address" value={user.email} />
                              <InfoRow icon={MapPin} label="Street Address" value={profileData.address} className="md:col-span-2" />
                              <InfoRow icon={Building2} label="City" value={profileData.city} />
                              <InfoRow icon={MapPin} label="State / Province" value={profileData.state} />
                          </div>
                      </Card>
                  </div>
              )}
              
              {/* --- EMPLOYMENT TAB --- */}
              {activeTab === 'employment' && (
                   <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <Card>
                          <h3 className="font-medium text-lg text-navy-900 dark:text-white mb-6">Job Details</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="p-4 bg-slate-50 dark:bg-navy-900 rounded-lg border border-slate-100 dark:border-navy-800">
                                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Service No.</p>
                                  <p className="text-lg font-mono font-medium text-navy-900 dark:text-white">{user.serviceNumber}</p>
                              </div>
                              <div className="p-4 bg-slate-50 dark:bg-navy-900 rounded-lg border border-slate-100 dark:border-navy-800">
                                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Department</p>
                                  <p className="text-lg font-medium text-navy-900 dark:text-white">{user.department}</p>
                              </div>
                              <div className="p-4 bg-slate-50 dark:bg-navy-900 rounded-lg border border-slate-100 dark:border-navy-800">
                                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Rank</p>
                                  <p className="text-lg font-medium text-navy-900 dark:text-white">{user.presentRank}</p>
                              </div>
                              <div className="p-4 bg-slate-50 dark:bg-navy-900 rounded-lg border border-slate-100 dark:border-navy-800">
                                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Grade Level</p>
                                  <p className="text-lg font-medium text-navy-900 dark:text-white">{user.level || 'N/A'}</p>
                              </div>
                              <div className="p-4 bg-slate-50 dark:bg-navy-900 rounded-lg border border-slate-100 dark:border-navy-800">
                                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Station / Prison</p>
                                  <p className="text-lg font-medium text-navy-900 dark:text-white">{user.prison || 'Unassigned'}</p>
                              </div>
                          </div>
                      </Card>
                   </div>
              )}

              {/* --- BANKING TAB --- */}
              {activeTab === 'banking' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Visual Bank Card */}
                          <div className="h-56 rounded-2xl bg-linear-to-br from-slate-800 to-black p-6 text-white shadow-2xl relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold-500/20 rounded-full blur-3xl -ml-10 -mb-10"></div>
                              
                              <div className="relative z-10 h-full flex flex-col justify-between">
                                  <div className="flex justify-between items-start">
                                      <img src="/chip.png" alt="" className="w-12 h-10 opacity-80 bg-gold-300/20 rounded-md" />
                                      <span className="font-medium italic text-xl tracking-wider opacity-90">{profileData.bankName}</span>
                                  </div>
                                  
                                  <div className="font-mono text-2xl tracking-widest mt-4 shadow-black drop-shadow-md">
                                      **** **** **** {profileData.accountNumber.slice(-4)}
                                  </div>
                                  
                                  <div className="flex justify-between items-end mt-auto">
                                      <div>
                                          <p className="text-[10px] text-slate-300 uppercase tracking-widest mb-1">Card Holder</p>
                                          <p className="font-medium uppercase tracking-wide text-sm">{profileData.accountName}</p>
                                      </div>
                                      <div className="text-right">
                                           <p className="text-[10px] text-slate-300 uppercase tracking-widest mb-1">Expires</p>
                                           <p className="font-medium">12/28</p>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          <Card>
                               <div className="flex justify-between items-center mb-4">
                                  <h3 className="font-medium text-lg text-navy-900 dark:text-white">Bank Details</h3>
                                  <Button size="sm" variant="ghost" onClick={handleOpenWizard}>
                                      Edit
                                  </Button>
                               </div>
                               <div className="space-y-4">
                                   <div>
                                       <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Bank Name</label>
                                       <p className="text-navy-900 dark:text-white font-medium">{profileData.bankName}</p>
                                   </div>
                                   <div>
                                       <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Account Number</label>
                                       <p className="text-navy-900 dark:text-white font-mono font-medium">{profileData.accountNumber}</p>
                                   </div>
                               </div>
                          </Card>
                      </div>
                  </div>
              )}

          </div>
      </div>

      <IDCardModal 
        isOpen={isIDModalOpen}
        onClose={() => setIsIDModalOpen(false)}
        user={user}
      />

      {/* --- Edit Wizard Modal --- */}
      <Modal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        title="Edit Profile"
        className="max-w-2xl"
      >
        <div className="mb-6">
           <Stepper steps={steps} currentStep={currentStep} />
        </div>

        <form onSubmit={handleWizardSubmit} className="min-h-[350px] flex flex-col justify-between">
           {currentStep === 0 && (
             <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <div className="grid grid-cols-2 gap-4">
                   <Input 
                     label="First Name" 
                     value={editForm.firstName}
                     onChange={e => setEditForm({...editForm, firstName: e.target.value})}
                   />
                   <Input 
                     label="Surname" 
                     value={editForm.surname}
                     onChange={e => setEditForm({...editForm, surname: e.target.value})}
                   />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <Input 
                     label="Date of Birth" 
                     type="date"
                     value={editForm.dob}
                     onChange={e => setEditForm({...editForm, dob: e.target.value})}
                   />
                   <Select 
                     label="Gender"
                     value={editForm.gender}
                     onChange={e => setEditForm({...editForm, gender: e.target.value})}
                   >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                   </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Input 
                        label="Nationality"
                        value={editForm.nationality}
                        onChange={e => setEditForm({...editForm, nationality: e.target.value})}
                    />
                    <Select 
                        label="Marital Status"
                        value={editForm.maritalStatus}
                        onChange={e => setEditForm({...editForm, maritalStatus: e.target.value})}
                    >
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                    </Select>
                </div>
             </div>
           )}

           {currentStep === 1 && (
             <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <Input 
                   label="Phone Number"
                   value={editForm.phone}
                   onChange={e => setEditForm({...editForm, phone: e.target.value})}
                />
                <Input 
                   label="Street Address"
                   value={editForm.address}
                   onChange={e => setEditForm({...editForm, address: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-4">
                   <Input 
                     label="City"
                     value={editForm.city}
                     onChange={e => setEditForm({...editForm, city: e.target.value})}
                   />
                   <Input 
                     label="State"
                     value={editForm.state}
                     onChange={e => setEditForm({...editForm, state: e.target.value})}
                   />
                </div>
             </div>
           )}

           {currentStep === 2 && (
             <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <Input 
                   label="Bank Name"
                   value={editForm.bankName}
                   onChange={e => setEditForm({...editForm, bankName: e.target.value})}
                />
                <Input 
                   label="Account Number"
                   value={editForm.accountNumber}
                   onChange={e => setEditForm({...editForm, accountNumber: e.target.value})}
                />
                <Input 
                   label="Account Name"
                   value={editForm.accountName}
                   onChange={e => setEditForm({...editForm, accountName: e.target.value})}
                />
             </div>
           )}

           {currentStep === 3 && (
             <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <div className="bg-slate-50 dark:bg-navy-900/50 p-4 rounded-lg border border-slate-100 dark:border-navy-700">
                    <h4 className="font-medium text-navy-900 dark:text-white mb-3 text-sm">Summary of Changes</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-xs text-slate-500">Name</p>
                            <p className="font-medium text-slate-700 dark:text-slate-300">{editForm.firstName} {editForm.surname}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Phone</p>
                            <p className="font-medium text-slate-700 dark:text-slate-300">{editForm.phone}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Address</p>
                            <p className="font-medium text-slate-700 dark:text-slate-300 truncate">{editForm.address}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Bank</p>
                            <p className="font-medium text-slate-700 dark:text-slate-300">{editForm.bankName}</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-sm rounded-lg">
                    <CheckCircle className="w-5 h-5 shrink-0" />
                    <p>Submitting this form will send a request to HR for approval. Your profile will be updated once approved.</p>
                </div>
             </div>
           )}

           <div className="flex justify-between pt-6 border-t border-slate-100 dark:border-navy-700 mt-6">
             <Button type="button" variant="ghost" onClick={handlePrevStep} disabled={currentStep === 0}>
                <ChevronLeft className="w-4 h-4 mr-2" /> Back
             </Button>
             
             {currentStep === steps.length - 1 ? (
                <Button type="submit">
                   Submit Changes
                </Button>
             ) : (
                <Button type="button" onClick={handleNextStep}>
                   Next <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
             )}
           </div>
        </form>
      </Modal>
    </div>
  );
};

export default Profile;