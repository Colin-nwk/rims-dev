import React, { useRef, useState, useEffect } from 'react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import { User } from '../types';
import { Modal, Button } from './ui/Components';
import { Download, Printer } from 'lucide-react';

interface IDCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const IDCardModal: React.FC<IDCardModalProps> = ({ isOpen, onClose, user }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    if (user && isOpen) {
      // Generate Verification URL linking to staff details
      // Using hash router format since the app uses HashRouter
      const verificationUrl = `${window.location.origin}/#/staff-profile/${user.id}`;

      QRCode.toDataURL(verificationUrl, { 
        width: 256, 
        margin: 0, 
        color: { dark: '#064e3b', light: '#ffffff' }, // NCoS Green dots
        errorCorrectionLevel: 'H'
      })
      .then((url: string) => {
        setQrCodeUrl(url);
      })
      .catch((err: any) => {
        console.error("Error generating QR code", err);
      });
    }
  }, [user, isOpen]);

  if (!user) return null;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // Higher resolution for print quality
        backgroundColor: null,
        useCORS: true
      });
      const link = document.createElement('a');
      link.download = `NCoS_ID_${user.firstName}_${user.surname}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error("Failed to generate ID card image", err);
    }
    setIsDownloading(false);
  };

  const handlePrint = () => {
    const printContent = document.getElementById('printable-id-card');
    const windowUrl = 'about:blank';
    const uniqueName = new Date();
    const windowName = 'Print' + uniqueName.getTime();
    const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');

    if (printWindow && printContent) {
      printWindow.document.write(`
        <html>
          <head>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,700&display=swap" rel="stylesheet">
            <script>
              tailwind.config = {
                theme: {
                  extend: {
                    fontFamily: {
                      serif: ['"Crimson Pro"', 'serif'],
                      sans: ['"DM Sans"', 'sans-serif'],
                    },
                    colors: {
                      navy: {
                        900: '#064e3b',
                        950: '#022c22',
                        800: '#0e6538',
                        700: '#0b7f43',
                      },
                      gold: {
                        400: '#fbbf24',
                        500: '#f59e0b',
                      }
                    }
                  }
                }
              }
            </script>
            <style>
              body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; -webkit-print-color-adjust: exact; }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 1000);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Staff Identity Card" className="max-w-md">
      <div className="flex flex-col items-center space-y-6">
        
        {/* ID Card Display Area */}
        <div id="printable-id-card">
          <div 
            ref={cardRef}
            className="w-[320px] h-[540px] bg-linear-to-b from-navy-900 via-navy-800 to-navy-900 rounded-2xl shadow-2xl overflow-hidden relative text-white flex flex-col border border-navy-700"
            style={{ fontFamily: '"DM Sans", sans-serif' }}
          >
             {/* Background Patterns */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500 rounded-full mix-blend-overlay opacity-10 blur-3xl transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500 rounded-full mix-blend-overlay opacity-10 blur-3xl transform -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>
             <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" 
                  style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}>
             </div>

             {/* 1. Header Section (Compact) */}
             <div className="pt-5 pb-2 flex flex-col items-center relative z-10">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-white to-slate-100 flex items-center justify-center text-navy-900 font-serif font-bold text-lg shadow-md border-2 border-gold-500">N</div>
                </div>
                <span className="font-serif text-xs font-bold tracking-[0.2em] uppercase text-center leading-tight text-gold-400">Nigerian<br/>Correctional Service</span>
             </div>

             {/* 2. Photo Section (Large & Prominent) */}
             <div className="flex justify-center py-2 relative z-10">
                <div className="w-44 h-44 rounded-full border-4 border-white/20 shadow-2xl overflow-hidden bg-navy-900 relative">
                    <div className="absolute inset-0 border-2 border-gold-500 rounded-full z-20"></div>
                    <img 
                        src={user.avatarUrl} 
                        alt="Staff" 
                        className="w-full h-full object-cover relative z-10"
                        crossOrigin="anonymous" 
                    />
                </div>
             </div>

             {/* 3. User Identity (Centered & Tight) */}
             <div className="text-center px-4 relative z-10 mt-1">
                <h2 className="text-2xl font-bold leading-tight text-white mb-1">{user.firstName} {user.surname}</h2>
                <div className="inline-block px-4 py-0.5 bg-gold-500 text-navy-900 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1 shadow-xs">
                    {user.presentRank}
                </div>
                <p className="text-[10px] text-slate-300 uppercase tracking-wide opacity-80">{user.department} Dept.</p>
             </div>

             {/* 4. Info Bar (Horizontal Grid) */}
             <div className="px-6 py-4 relative z-10">
                <div className="bg-white/10 rounded-lg p-2 border border-white/10 backdrop-blur-md flex justify-around items-center text-center divide-x divide-white/20">
                    <div className="flex-1 px-1">
                        <span className="block text-[8px] text-slate-300 uppercase tracking-wider font-semibold mb-0.5">Service No</span>
                        <span className="block text-sm font-mono font-bold text-white tracking-wide">{user.serviceNumber}</span>
                    </div>
                     <div className="flex-1 px-1">
                        <span className="block text-[8px] text-slate-300 uppercase tracking-wider font-semibold mb-0.5">Joined</span>
                        <span className="block text-xs font-medium text-white">{user.joinDate}</span>
                    </div>
                </div>
             </div>

             {/* 5. Footer & QR (Bottom Anchored) */}
             <div className="mt-auto pb-6 flex flex-col items-center justify-center relative z-10">
                <div className="p-2 bg-white rounded-xl shadow-lg mb-2">
                    <div style={{ height: "112px", width: "112px" }}>
                    {qrCodeUrl && (
                        <img src={qrCodeUrl} alt="QR Code" className="w-full h-full" />
                    )}
                    </div>
                </div>
                 <p className="text-[8px] text-slate-400 leading-tight text-center max-w-[200px] opacity-70">
                    Scan to verify staff identity & status. <br/>Property of Federal Government of Nigeria.
                 </p>
             </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 w-full justify-center">
           <Button variant="outline" onClick={handleDownload} disabled={isDownloading}>
              <Download className="w-4 h-4 mr-2" />
              {isDownloading ? 'Processing...' : 'Download PNG'}
           </Button>
           <Button onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print Card
           </Button>
        </div>
      </div>
    </Modal>
  );
};

export default IDCardModal;