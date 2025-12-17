import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input, Select } from '../components/ui/Components';
import { useAuth, useApprovals, useToast } from '../App';
import { BioData as BioDataType } from '../types';
import { User, MapPin, Phone, CreditCard, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';

const steps = [
  { id: 1, title: 'Personal Details', icon: User },
  { id: 2, title: 'Contact Info', icon: MapPin },
  { id: 3, title: 'Emergency Contact', icon: Phone },
  { id: 4, title: 'Banking Details', icon: CreditCard },
];

const BioData = () => {
  const { user } = useAuth();
  const { addApproval } = useApprovals();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<BioDataType>({
    dateOfBirth: '',
    nationality: '',
    maritalStatus: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    emergencyName: '',
    emergencyRelation: '',
    emergencyPhone: '',
    bankName: '',
    accountNumber: '',
  });

  const handleChange = (field: keyof BioDataType, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate network delay
    setTimeout(() => {
      addApproval({
        type: 'Bio Data',
        user: user ? `${user.firstName} ${user.surname}` : 'Staff Member',
        detail: 'Updated Bio Data Information',
        data: formData
      });
      setIsSubmitting(false);
      navigate('/profile');
      toast('success', "Bio Data information has been submitted for review.", "Submission Successful");
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-serif font-medium text-navy-900 dark:text-white">Update Bio Data</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Please complete all sections accurately. This information will be reviewed by HR.</p>
      </div>

      {/* Stepper */}
      <div className="relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 dark:bg-navy-700 -z-10 transform -translate-y-1/2"></div>
        <div className="flex justify-between">
          {steps.map((step) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            const Icon = step.icon;
            
            return (
              <div key={step.id} className="flex flex-col items-center gap-2 bg-slate-50 dark:bg-navy-950 px-2 transition-colors">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    isActive ? 'bg-navy-900 text-white shadow-lg shadow-navy-900/20 dark:bg-gold-500 dark:text-navy-900' : 
                    isCompleted ? 'bg-emerald-500 text-white' : 'bg-white border-2 border-slate-200 text-slate-400 dark:bg-navy-900 dark:border-navy-700 dark:text-slate-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-xs font-medium ${isActive ? 'text-navy-900 dark:text-white' : 'text-slate-500 dark:text-slate-500'}`}>{step.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="min-h-[400px] flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-navy-900 dark:text-white flex items-center gap-2">
              {React.createElement(steps[currentStep - 1].icon, { className: 'w-5 h-5 text-gold-500' })}
              {steps[currentStep - 1].title}
            </h3>

            {currentStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <Input label="Date of Birth" type="date" value={formData.dateOfBirth} onChange={e => handleChange('dateOfBirth', e.target.value)} required />
                <Input label="Nationality" value={formData.nationality} onChange={e => handleChange('nationality', e.target.value)} placeholder="e.g. American" required />
                <Select
                   label="Gender"
                   value={formData.gender} 
                   onChange={e => handleChange('gender', e.target.value)}
                >
                     <option value="">Select Gender</option>
                     <option value="Male">Male</option>
                     <option value="Female">Female</option>
                     <option value="Other">Other</option>
                </Select>
                <Select
                   label="Marital Status"
                   value={formData.maritalStatus} 
                   onChange={e => handleChange('maritalStatus', e.target.value)}
                >
                     <option value="">Select Status</option>
                     <option value="Single">Single</option>
                     <option value="Married">Married</option>
                     <option value="Divorced">Divorced</option>
                </Select>
              </div>
            )}

            {currentStep === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="md:col-span-2">
                   <Input label="Street Address" value={formData.address} onChange={e => handleChange('address', e.target.value)} placeholder="123 Main St" required />
                </div>
                <Input label="City" value={formData.city} onChange={e => handleChange('city', e.target.value)} required />
                <Input label="State / Province" value={formData.state} onChange={e => handleChange('state', e.target.value)} required />
                <Input label="Zip / Postal Code" value={formData.zipCode} onChange={e => handleChange('zipCode', e.target.value)} required />
              </div>
            )}

            {currentStep === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <Input label="Emergency Contact Name" value={formData.emergencyName} onChange={e => handleChange('emergencyName', e.target.value)} required />
                <Input label="Relationship" value={formData.emergencyRelation} onChange={e => handleChange('emergencyRelation', e.target.value)} placeholder="e.g. Spouse" required />
                <Input label="Phone Number" value={formData.emergencyPhone} onChange={e => handleChange('emergencyPhone', e.target.value)} required />
              </div>
            )}

            {currentStep === 4 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <Input label="Bank Name" value={formData.bankName} onChange={e => handleChange('bankName', e.target.value)} required />
                <Input label="Account Number" value={formData.accountNumber} onChange={e => handleChange('accountNumber', e.target.value)} required />
              </div>
            )}
          </div>

          <div className="flex justify-between pt-6 border-t border-slate-100 dark:border-navy-700 mt-6">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={handleBack} 
              disabled={currentStep === 1}
              className={currentStep === 1 ? 'invisible' : ''}
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            
            {currentStep < steps.length ? (
              <Button type="button" onClick={handleNext}>
                Next Step <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" isLoading={isSubmitting} variant="primary">
                Submit for Approval
              </Button>
            )}
          </div>
        </Card>
      </form>
    </div>
  );
};

export default BioData;