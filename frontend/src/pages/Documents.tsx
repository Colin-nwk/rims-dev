import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input, TextArea } from '../components/ui/Components';
import { Document, DocumentVersion } from '../types';
import { useAuth, useApprovals, useDocuments } from '../App';
import { UploadCloud, FileText, Download, Trash2, Eye, History, Upload, File, X, Quote, Maximize2, ExternalLink } from 'lucide-react';

const Documents = () => {
  const { user } = useAuth();
  const { addApproval } = useApprovals();
  const { documents, addDocument, updateDocument } = useDocuments();
  
  const [isDragging, setIsDragging] = useState(false);
  
  // Modals
  const [historyModalDoc, setHistoryModalDoc] = useState<Document | null>(null);
  const [uploadVersionDoc, setUploadVersionDoc] = useState<Document | null>(null);
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  // Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form Data
  const [newDocData, setNewDocData] = useState({ title: '', category: 'Other' });
  const [versionNotes, setVersionNotes] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const versionFileInputRef = useRef<HTMLInputElement>(null);

  // Filter for "My Documents"
  const myDocuments = user ? documents.filter(doc => doc.userId === user.id) : [];

  // --- Helpers ---
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const resetUploadState = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    setNewDocData({ title: '', category: 'Other' });
    setVersionNotes('');
  };

  const closeModals = () => {
    if (isUploading) return; // Prevent closing while uploading
    setHistoryModalDoc(null);
    setUploadVersionDoc(null);
    setIsNewDocModalOpen(false);
    setPreviewDoc(null);
    resetUploadState();
  };

  // --- Handlers ---

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (file: File) => {
    // Validate file type/size if needed
    setSelectedFile(file);
    // Auto-fill title for new doc if empty
    if (!newDocData.title) {
        setNewDocData(prev => ({ ...prev, title: file.name.split('.')[0] }));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
      if (!uploadVersionDoc) {
          setIsNewDocModalOpen(true);
      }
    }
  };

  const handleMainUploadClick = () => {
      // Trigger file input
      if (fileInputRef.current) {
          fileInputRef.current.click();
      }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          handleFileSelect(e.target.files[0]);
          setIsNewDocModalOpen(true);
      }
  };

  const handleVersionFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          handleFileSelect(e.target.files[0]);
      }
  };

  // --- Upload Logic ---

  const simulateUploadProcess = (onComplete: () => void) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          return 95; // Wait for final step
        }
        return prev + Math.random() * 10;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      setTimeout(() => {
        onComplete();
        resetUploadState();
      }, 500);
    }, 2000);
  };

  const handleNewDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !user) return;

    simulateUploadProcess(() => {
        const previewUrl = URL.createObjectURL(selectedFile);
        const fileExt = selectedFile.name.split('.').pop()?.toUpperCase() || 'FILE';

        const newDoc: Document = {
            id: `d${Date.now()}`,
            userId: user.id,
            title: newDocData.title,
            category: newDocData.category as any,
            status: 'pending',
            dateUploaded: 'Just now',
            size: formatBytes(selectedFile.size),
            type: fileExt,
            uploadedBy: `${user.firstName} ${user.surname}`,
            version: 1,
            history: [],
            notes: 'Initial Upload',
            url: previewUrl
        };
        addDocument(newDoc);
        
        // Notify HR
        addApproval({
          type: 'Document',
          user: `${user.firstName} ${user.surname}`,
          detail: `Uploaded new document: ${newDocData.title}`,
          data: { documentId: newDoc.id }
        });

        setIsNewDocModalOpen(false);
    });
  };

  const handleVersionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadVersionDoc || !selectedFile || !user) return;

    simulateUploadProcess(() => {
      // Archive current version
      const historyEntry: DocumentVersion = {
        id: `${uploadVersionDoc.id}_v${uploadVersionDoc.version}`,
        dateUploaded: uploadVersionDoc.dateUploaded,
        status: uploadVersionDoc.status,
        size: uploadVersionDoc.size,
        uploadedBy: uploadVersionDoc.uploadedBy,
        version: uploadVersionDoc.version,
        notes: uploadVersionDoc.notes,
        url: uploadVersionDoc.url
      };
      
      const previewUrl = URL.createObjectURL(selectedFile);
      const fileExt = selectedFile.name.split('.').pop()?.toUpperCase() || 'FILE';

      const updatedDoc: Document = {
        ...uploadVersionDoc,
        version: uploadVersionDoc.version + 1,
        dateUploaded: 'Just now',
        status: 'pending',
        size: formatBytes(selectedFile.size),
        type: fileExt,
        uploadedBy: `${user.firstName} ${user.surname}`,
        history: [historyEntry, ...(uploadVersionDoc.history || [])],
        notes: versionNotes,
        url: previewUrl
      };

      updateDocument(updatedDoc);
      
      // Notify HR
      addApproval({
        type: 'Document',
        user: `${user.firstName} ${user.surname}`,
        detail: `Updated document: ${uploadVersionDoc.title} (v${uploadVersionDoc.version + 1})`,
        data: { documentId: updatedDoc.id }
      });

      setUploadVersionDoc(null);
    });
  };

  // --- UI Components ---

  const FilePreview = ({ file, onRemove }: { file: File, onRemove?: () => void }) => (
    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-navy-900/50 border border-slate-200 dark:border-navy-700 rounded-lg relative overflow-hidden">
      <div className="relative z-10 flex items-center gap-4 w-full">
        <div className="p-2 bg-white dark:bg-navy-800 rounded-sm shadow-xs text-navy-900 dark:text-white">
            <FileText className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-navy-900 dark:text-white truncate">{file.name}</p>
            <div className="flex items-center gap-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">{formatBytes(file.size)}</p>
                {isUploading && <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">• Uploading...</span>}
            </div>
        </div>
        {onRemove && !isUploading && (
            <button onClick={onRemove} className="text-slate-400 hover:text-red-500 transition-colors">
            <X className="w-5 h-5" />
            </button>
        )}
        {isUploading && (
            <div className="text-emerald-600 dark:text-emerald-400">
                <span className="text-sm font-bold">{Math.round(uploadProgress)}%</span>
            </div>
        )}
      </div>
      {isUploading && (
          <div 
            className="absolute bottom-0 left-0 h-1 bg-emerald-500 transition-all duration-300 ease-out"
            style={{ width: `${uploadProgress}%` }}
          />
      )}
    </div>
  );

  const PreviewContent = ({ doc }: { doc: Document }) => {
    const [textContent, setTextContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!doc.url) {
            setLoading(false);
            return;
        }

        if (['MD', 'TXT', 'MARKDOWN'].includes(doc.type)) {
            fetch(doc.url)
                .then(res => res.text())
                .then(text => {
                    setTextContent(text);
                    setLoading(false);
                })
                .catch(() => {
                    setTextContent("Error loading text content.");
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [doc]);

    if (!doc.url) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-50 dark:bg-navy-900/50 rounded-lg">
                <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">Preview Not Available</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-2">
                    This document does not have a preview available. You may need to download it to view the content.
                </p>
            </div>
        );
    }

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-900 dark:border-white"></div></div>;
    }

    // Images
    if (['JPG', 'JPEG', 'PNG', 'WEBP', 'GIF'].includes(doc.type)) {
        return (
            <div className="flex items-center justify-center bg-slate-100 dark:bg-navy-950 rounded-lg p-2 h-full overflow-auto">
                <img src={doc.url} alt={doc.title} className="max-w-full max-h-[70vh] object-contain shadow-lg" />
            </div>
        );
    }

    // PDF
    if (doc.type === 'PDF') {
        return (
            <div className="h-[75vh] w-full bg-slate-100 dark:bg-navy-900 rounded-lg overflow-hidden border border-slate-200 dark:border-navy-700">
                <iframe src={doc.url} className="w-full h-full" title={doc.title}></iframe>
            </div>
        );
    }

    // Text / Markdown
    if (['MD', 'TXT', 'MARKDOWN'].includes(doc.type)) {
        return (
            <div className="h-[70vh] w-full overflow-auto bg-white dark:bg-navy-950 p-6 rounded-lg border border-slate-200 dark:border-navy-700 font-mono text-sm whitespace-pre-wrap text-slate-800 dark:text-slate-200">
                {textContent}
            </div>
        );
    }

    // Default Fallback
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-50 dark:bg-navy-900/50 rounded-lg border-2 border-dashed border-slate-200 dark:border-navy-700">
            <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">No Preview for this File Type</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
                .{doc.type} files cannot be previewed directly. Please download the file to view it.
            </p>
            <Button className="mt-4" onClick={() => window.open(doc.url, '_blank')}>
                <Download className="w-4 h-4 mr-2" /> Download File
            </Button>
        </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-medium text-navy-900 dark:text-white">My Documents</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your employment files and contracts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Area */}
        <Card className="lg:col-span-3">
           <div 
             className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${isDragging ? 'border-gold-500 bg-gold-50 dark:bg-gold-500/10' : 'border-slate-300 dark:border-navy-600 hover:border-navy-500 hover:bg-slate-50 dark:hover:bg-navy-800/50'}`}
             onDragOver={handleDragOver}
             onDragLeave={handleDragLeave}
             onDrop={handleDrop}
             onClick={handleMainUploadClick}
           >
             <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                onChange={handleFileInputChange}
             />
             <div className="w-16 h-16 bg-blue-50 dark:bg-navy-800 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
               <UploadCloud className="w-8 h-8" />
             </div>
             <h3 className="text-lg font-medium text-navy-900 dark:text-white">Upload New Document</h3>
             <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-sm">Drag and drop your files here, or click to browse. Supported formats: PDF, JPG, PNG, MD, TXT (Max 5MB)</p>
           </div>
        </Card>

        {/* Document List */}
        <div className="lg:col-span-3">
          <Card noPadding>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-navy-900/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-navy-700">
                    <th className="px-6 py-4">Document Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Uploaded Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-navy-700">
                  {myDocuments.length === 0 ? (
                      <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-slate-400 dark:text-slate-500">
                              No documents uploaded yet.
                          </td>
                      </tr>
                  ) : (
                    myDocuments.map((doc) => (
                        <tr key={doc.id} className="group hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="p-2 bg-slate-100 dark:bg-navy-700 rounded-sm text-slate-600 dark:text-slate-300 group-hover:bg-white dark:group-hover:bg-navy-600 group-hover:text-navy-900 dark:group-hover:text-white transition-colors">
                                <FileText className="w-5 h-5" />
                                </div>
                                {doc.version > 1 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-navy-900 dark:bg-gold-500 text-[10px] text-white dark:text-navy-900 font-bold">
                                    v{doc.version}
                                </span>
                                )}
                            </div>
                            <div>
                                <p className="font-medium text-navy-900 dark:text-white">{doc.title}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{doc.size} • {doc.type}</p>
                            </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-navy-700 text-slate-800 dark:text-slate-200">
                            {doc.category}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{doc.dateUploaded}</td>
                        <td className="px-6 py-4">
                            <Badge variant={
                            doc.status === 'approved' ? 'success' : 
                            doc.status === 'rejected' ? 'error' : 'warning'
                            }>
                            {doc.status}
                            </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                            <button 
                                className="p-2 text-slate-400 hover:text-navy-900 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-navy-700" 
                                title="Upload New Version"
                                onClick={() => {
                                    setUploadVersionDoc(doc);
                                    resetUploadState();
                                }}
                            >
                                <Upload className="w-4 h-4" />
                            </button>
                            <button 
                                className="p-2 text-slate-400 hover:text-navy-900 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-navy-700" 
                                title="Version History"
                                onClick={() => setHistoryModalDoc(doc)}
                            >
                                <History className="w-4 h-4" />
                            </button>
                            <div className="w-px h-4 bg-slate-300 dark:bg-navy-600 mx-1"></div>
                            <button 
                                className="p-2 text-slate-400 hover:text-navy-900 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-navy-700" 
                                title="View"
                                onClick={() => setPreviewDoc(doc)}
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                            <button 
                                className="p-2 text-slate-400 hover:text-navy-900 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-navy-700" 
                                title="Download"
                                onClick={() => {
                                    if(doc.url) {
                                        const link = document.createElement('a');
                                        link.href = doc.url;
                                        link.download = doc.title;
                                        link.click();
                                    }
                                }}
                            >
                                <Download className="w-4 h-4" />
                            </button>
                            {doc.status !== 'approved' && (
                                <button className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete">
                                <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                            </div>
                        </td>
                        </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* --- Modals --- */}

      {/* Document Preview Modal */}
      {previewDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-xs animate-in fade-in duration-200">
             <div className="bg-white dark:bg-navy-800 rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-transparent dark:border-navy-700">
                 {/* Header */}
                 <div className="px-6 py-4 border-b border-slate-100 dark:border-navy-700 flex justify-between items-center bg-slate-50/50 dark:bg-navy-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-navy-800 rounded-sm border border-slate-200 dark:border-navy-700">
                            <FileText className="w-5 h-5 text-navy-900 dark:text-white" />
                        </div>
                        <div>
                            <h3 className="font-medium text-lg text-navy-900 dark:text-white">{previewDoc.title}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {previewDoc.type} • {previewDoc.size} • Uploaded {previewDoc.dateUploaded}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                         {previewDoc.url && (
                             <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => window.open(previewDoc.url, '_blank')}
                                title="Open in New Tab"
                            >
                                <ExternalLink className="w-4 h-4" />
                             </Button>
                         )}
                         <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setPreviewDoc(null)}
                            className="text-slate-500 hover:text-navy-900 dark:text-slate-400 dark:hover:text-white"
                         >
                            <X className="w-5 h-5" />
                         </Button>
                    </div>
                 </div>
                 
                 {/* Content */}
                 <div className="flex-1 overflow-hidden p-2 bg-slate-100/50 dark:bg-navy-900/20">
                     <PreviewContent doc={previewDoc} />
                 </div>
             </div>
          </div>
      )}

      {/* New Document Upload Modal */}
      <Modal
        isOpen={isNewDocModalOpen}
        onClose={closeModals}
        title="Upload New Document"
      >
          <form onSubmit={handleNewDocSubmit} className="space-y-6">
              {!selectedFile ? (
                   <div 
                   className="border-2 border-dashed border-slate-300 dark:border-navy-600 rounded-lg p-8 text-center hover:border-navy-500 dark:hover:border-gold-500 hover:bg-slate-50 dark:hover:bg-navy-800 transition-all cursor-pointer"
                   onClick={() => fileInputRef.current?.click()}
                 >
                    <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Click to select file</p>
                    <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG, MD, TXT up to 5MB</p>
                 </div>
              ) : (
                  <FilePreview file={selectedFile} onRemove={() => setSelectedFile(null)} />
              )}

              <div className="space-y-4">
                  <Input 
                    label="Document Title" 
                    value={newDocData.title}
                    onChange={e => setNewDocData({...newDocData, title: e.target.value})}
                    placeholder="e.g. Employment Contract Signed"
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
                    <select 
                        className="w-full h-10 rounded-md border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-navy-900 dark:focus:ring-gold-500"
                        value={newDocData.category}
                        onChange={e => setNewDocData({...newDocData, category: e.target.value})}
                    >
                        <option value="Contract">Contract</option>
                        <option value="ID">ID / Passport</option>
                        <option value="Certificate">Certificate</option>
                        <option value="Other">Other</option>
                    </select>
                  </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                 <Button type="button" variant="ghost" onClick={closeModals} disabled={isUploading}>Cancel</Button>
                 <Button type="submit" isLoading={isUploading} disabled={!selectedFile}>Upload Document</Button>
              </div>
          </form>
      </Modal>

      {/* Upload New Version Modal */}
      <Modal 
        isOpen={!!uploadVersionDoc} 
        onClose={closeModals} 
        title="Upload New Version"
      >
        <form onSubmit={handleVersionSubmit} className="space-y-6">
           {uploadVersionDoc && (
             <div className="p-3 bg-blue-50 dark:bg-navy-700/50 text-blue-800 dark:text-blue-200 rounded-lg text-sm flex items-center gap-3">
               <File className="w-4 h-4" />
               <div>
                 <p className="font-medium">Updating: {uploadVersionDoc.title}</p>
                 <p className="text-xs opacity-80">Creating Version {uploadVersionDoc.version + 1}</p>
               </div>
             </div>
           )}

           {!selectedFile ? (
             <div 
               className="border-2 border-dashed border-slate-300 dark:border-navy-600 rounded-lg p-8 text-center hover:border-navy-500 dark:hover:border-gold-500 hover:bg-slate-50 dark:hover:bg-navy-800 transition-all cursor-pointer"
               onClick={() => versionFileInputRef.current?.click()}
             >
                <input 
                    type="file" 
                    ref={versionFileInputRef}
                    className="hidden" 
                    onChange={handleVersionFileInputChange}
                />
                <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Select new version file</p>
                <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG, MD, TXT up to 5MB</p>
             </div>
           ) : (
                <FilePreview file={selectedFile} onRemove={() => setSelectedFile(null)} />
           )}
           
           <TextArea 
             label="Change Notes" 
             placeholder="What changed in this version? (e.g. Updated address)" 
             value={versionNotes}
             onChange={e => setVersionNotes(e.target.value)}
             rows={3}
           />

           <div className="flex justify-end gap-3 pt-2">
             <Button type="button" variant="ghost" onClick={closeModals} disabled={isUploading}>Cancel</Button>
             <Button type="submit" isLoading={isUploading} disabled={!selectedFile}>Upload Version</Button>
           </div>
        </form>
      </Modal>

      {/* Version History Modal */}
      <Modal 
        isOpen={!!historyModalDoc} 
        onClose={closeModals} 
        title="Version History"
        className="max-w-2xl"
      >
        {historyModalDoc && (
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-navy-900/50 rounded-lg">
              <div className="p-2 bg-white dark:bg-navy-800 rounded-sm shadow-xs">
                <FileText className="w-6 h-6 text-navy-900 dark:text-white" />
              </div>
              <div>
                <h4 className="font-medium text-navy-900 dark:text-white">{historyModalDoc.title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Current Version: v{historyModalDoc.version}</p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute top-0 bottom-0 left-6 w-px bg-slate-200 dark:bg-navy-700"></div>
              <div className="space-y-6">
                {/* Current Version */}
                <div className="relative pl-14">
                   <div className="absolute left-4 top-2 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-navy-800 shadow-xs"></div>
                   <div className="flex justify-between items-start bg-emerald-50/50 dark:bg-emerald-900/10 p-4 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                     <div className="flex-1">
                       <div className="flex items-center gap-2 mb-2">
                         <span className="font-bold text-navy-900 dark:text-white text-sm">Version {historyModalDoc.version}</span>
                         <Badge variant={historyModalDoc.status === 'approved' ? 'success' : historyModalDoc.status === 'rejected' ? 'error' : 'warning'}>
                           {historyModalDoc.status}
                         </Badge>
                         <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-white dark:bg-navy-900 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-500/30 shadow-xs">Current</span>
                       </div>
                       <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Uploaded {historyModalDoc.dateUploaded} by {historyModalDoc.uploadedBy}</p>
                       {historyModalDoc.notes && (
                           <div className="flex items-start gap-2 mt-3 text-slate-600 dark:text-slate-300 bg-white/60 dark:bg-navy-900/50 p-2 rounded-sm border border-emerald-100/50 dark:border-emerald-500/20">
                             <Quote className="w-3 h-3 mt-0.5 shrink-0 text-emerald-400" />
                             <p className="text-sm italic">{historyModalDoc.notes}</p>
                           </div>
                       )}
                     </div>
                     <div className="text-right pl-4">
                       <span className="text-xs font-mono text-slate-500 dark:text-slate-400 block">{historyModalDoc.size}</span>
                       <div className="flex flex-col gap-1 mt-2">
                           {historyModalDoc.url && (
                                <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-7 px-2 text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
                                    onClick={() => setPreviewDoc(historyModalDoc)}
                                >
                                    <Eye className="w-3 h-3 mr-1" /> View
                                </Button>
                           )}
                           <Button size="sm" variant="ghost" className="h-7 px-2 text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-500/20">
                                <Download className="w-3 h-3 mr-1" /> Download
                           </Button>
                       </div>
                     </div>
                   </div>
                </div>

                {/* History */}
                {historyModalDoc.history && historyModalDoc.history.map((ver) => (
                  <div key={ver.id} className="relative pl-14">
                    <div className="absolute left-5 top-2 w-2 h-2 rounded-full bg-slate-300 dark:bg-navy-600 ring-4 ring-white dark:ring-navy-800"></div>
                    <div className="flex justify-between items-start p-4 rounded-lg border border-slate-100 dark:border-navy-700 bg-white dark:bg-navy-800 hover:bg-slate-50 dark:hover:bg-navy-700/50 transition-colors group">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">Version {ver.version}</span>
                          <Badge variant={ver.status === 'approved' ? 'success' : ver.status === 'rejected' ? 'error' : 'warning'}>
                           {ver.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Uploaded {ver.dateUploaded} by {ver.uploadedBy}</p>
                         {ver.notes && (
                           <div className="flex items-start gap-2 mt-2 text-slate-500 dark:text-slate-400">
                             <Quote className="w-3 h-3 mt-0.5 shrink-0 text-slate-300 dark:text-slate-500" />
                             <p className="text-sm italic">{ver.notes}</p>
                           </div>
                       )}
                      </div>
                      <div className="text-right pl-4 flex flex-col items-end">
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{ver.size}</span>
                         <Button size="sm" variant="ghost" className="h-7 px-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Download className="w-3 h-3 mr-1" /> Download
                       </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {(!historyModalDoc.history || historyModalDoc.history.length === 0) && (
                   <div className="pl-14 py-4 text-center">
                     <p className="text-sm text-slate-400 italic">No previous versions available.</p>
                   </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-navy-700">
              <Button variant="ghost" onClick={closeModals}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Documents;