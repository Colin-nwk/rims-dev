import React, { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePolicies, useToast } from '../App';
import { Button, Card, Badge } from '../components/ui/Components';
import { ArrowLeft, Calendar, User, Download, Shield, FileText, Printer, Share2, ChevronRight, BookOpen, Clock } from 'lucide-react';

const PolicyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { policies } = usePolicies();
  const { toast } = useToast();
  const policy = policies.find(p => p.id === id);
  const contentRef = useRef<HTMLDivElement>(null);

  if (!policy) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-slate-100 dark:bg-navy-800 rounded-full flex items-center justify-center mb-6">
            <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600" />
        </div>
        <h2 className="text-2xl font-semibold text-navy-900 dark:text-white mb-2">Policy Not Found</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">The policy document you are looking for does not exist or has been removed from the system.</p>
        <Button onClick={() => navigate('/policies')} variant="primary">
            <ArrowLeft className="w-4 h-4 mr-2" /> Return to Policy Library
        </Button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast('success', 'Link copied to clipboard');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
       {/* Breadcrumbs & Navigation */}
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in slide-in-from-top-4 duration-500">
          <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400">
             <button onClick={() => navigate('/policies')} className="hover:text-navy-900 dark:hover:text-white transition-colors">Policies</button>
             <ChevronRight className="w-4 h-4 mx-2" />
             <span className="text-navy-900 dark:text-white font-medium truncate max-w-[200px] sm:max-w-none">{policy.title}</span>
          </nav>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sidebar - Metadata & TOC */}
          <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24 animate-in slide-in-from-left-4 duration-500 delay-100">
             <Card>
                 <div className="mb-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">Properties</span>
                    <h1 className="font-bold text-xl text-navy-900 dark:text-white leading-tight">{policy.title}</h1>
                 </div>
                 
                 <div className="space-y-4 text-sm">
                    <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-navy-800">
                       <span className="text-slate-500 flex items-center gap-2"><Shield className="w-4 h-4" /> Category</span>
                       <span className="font-medium text-navy-900 dark:text-white">{policy.category}</span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-navy-800">
                       <span className="text-slate-500 flex items-center gap-2"><BookOpen className="w-4 h-4" /> Version</span>
                       <Badge variant="outline" className="font-mono bg-slate-50 dark:bg-navy-800">v{policy.version}</Badge>
                    </div>

                     <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-navy-800">
                       <span className="text-slate-500 flex items-center gap-2"><Clock className="w-4 h-4" /> Updated</span>
                       <span className="font-medium text-navy-900 dark:text-white">{policy.dateUpdated}</span>
                    </div>

                     <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-navy-800">
                       <span className="text-slate-500 flex items-center gap-2"><User className="w-4 h-4" /> Author</span>
                       <span className="font-medium text-navy-900 dark:text-white truncate max-w-[100px]" title={policy.uploadedBy}>{policy.uploadedBy}</span>
                    </div>
                 </div>

                 <div className="mt-8 flex flex-col gap-3">
                    <Button variant="primary" className="w-full justify-center">
                       <Download className="w-4 h-4 mr-2" /> Download PDF
                    </Button>
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" onClick={handlePrint} className="justify-center">
                            <Printer className="w-4 h-4 mr-2" /> Print
                        </Button>
                        <Button variant="outline" onClick={handleShare} className="justify-center">
                            <Share2 className="w-4 h-4 mr-2" /> Share
                        </Button>
                    </div>
                 </div>
             </Card>

             {/* Table of Contents */}
             <div className="hidden lg:block p-4 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-900/30">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Contents</h4>
                <ul className="space-y-2 text-sm">
                    <li><a href="#" className="text-navy-900 dark:text-white font-medium hover:underline decoration-gold-500 underline-offset-2">1. Purpose and Scope</a></li>
                    <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white transition-colors">2. General Guidelines</a></li>
                    <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white transition-colors">3. Responsibilities</a></li>
                    <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white transition-colors">4. Compliance & Enforcement</a></li>
                    <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white transition-colors">5. Contact Information</a></li>
                </ul>
             </div>
          </div>

          {/* Main Content - Document View */}
          <div className="lg:col-span-9 animate-in slide-in-from-bottom-8 duration-700 delay-200">
              <div className="bg-white dark:bg-navy-900 rounded-xl shadow-xs border border-slate-200 dark:border-navy-800 min-h-[800px] flex flex-col">
                  
                  {/* Modern Header */}
                  <div className="p-8 md:p-12 pb-6 border-b border-slate-100 dark:border-navy-800">
                     <div className="flex items-center gap-3 mb-6">
                        <Badge variant={policy.category === 'Safety' ? 'error' : 'default'} className="uppercase text-[10px]">
                            {policy.category}
                        </Badge>
                        <span className="text-xs text-slate-400 font-mono">REF: POL-{policy.id}</span>
                     </div>

                     <h1 className="text-3xl md:text-4xl font-bold text-navy-900 dark:text-white mb-4 leading-tight">
                        {policy.title}
                     </h1>
                     <p className="text-lg text-slate-500 dark:text-slate-400 max-w-3xl">
                        Official policy document for the Nigerian Correctional Service. Last updated on {policy.dateUpdated}.
                     </p>
                  </div>

                  {/* Document Body */}
                  <div className="flex-1 px-8 md:px-12 py-10" ref={contentRef}>
                     <div className="prose dark:prose-invert max-w-none prose-slate prose-headings:font-bold prose-headings:text-navy-900 dark:prose-headings:text-white prose-p:leading-relaxed prose-li:marker:text-gold-500">
                        {/* Executive Summary / Main Content */}
                        <div className="bg-slate-50 dark:bg-navy-800/50 p-6 rounded-lg border-l-4 border-gold-500 mb-10 not-prose">
                            <h3 className="font-bold text-navy-900 dark:text-white text-sm uppercase tracking-wider mb-2">Executive Summary</h3>
                            <div 
                                className="text-slate-600 dark:text-slate-300"
                                dangerouslySetInnerHTML={{ __html: policy.content }}
                            />
                        </div>
                        
                        <h3>1. Purpose and Scope</h3>
                        <p>
                            This document outlines the standard operating procedures and guidelines relevant to the <strong>{policy.category}</strong> department within the Nigerian Correctional Service. 
                            Its primary objective is to ensure consistency, compliance, and operational excellence across all units.
                        </p>
                        <p>
                            All staff members, contractors, and relevant stakeholders are expected to adhere to the principles laid out herein. Failure to comply may result in disciplinary action.
                        </p>
                        
                        <h3>2. General Guidelines</h3>
                        <p>
                            To maintain the highest standards of integrity and efficiency:
                        </p>
                        <ul>
                            <li><strong>Adherence:</strong> Strict adherence to these protocols is mandatory.</li>
                            <li><strong>Communication:</strong> Updates to this policy will be communicated via the official internal portal.</li>
                            <li><strong>Reporting:</strong> Any deviations or violations must be reported immediately to the Directorate of Human Resources.</li>
                        </ul>
                        
                        <h3>3. Responsibilities</h3>
                        <p>
                            It is the responsibility of every Head of Department to ensure their team members are fully aware of these guidelines. Periodic training and assessments will be conducted to verify understanding and compliance.
                        </p>

                        <h3>4. Compliance & Enforcement</h3>
                        <p>
                            The Internal Audit Unit is charged with the responsibility of monitoring compliance. Random checks and scheduled audits will be performed quarterly.
                        </p>
                     </div>

                     {/* Footer Metadata */}
                     <div className="mt-16 pt-10 border-t border-slate-100 dark:border-navy-800 text-sm text-slate-500 dark:text-slate-400">
                        <p>Approved by: <span className="font-medium text-navy-900 dark:text-white">{policy.uploadedBy}</span></p>
                        <p>Department: {policy.category}</p>
                     </div>
                  </div>
              </div>
          </div>
       </div>
    </div>
  );
};
export default PolicyDetail;