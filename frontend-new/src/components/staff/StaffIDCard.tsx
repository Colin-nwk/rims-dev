import React, { useRef, useState, useEffect } from "react";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import { Download, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { imageUrlToBase64 } from "@/lib/api/apiClient";
import { StaffIDCardData } from "@/lib/api/staff";

interface StaffIDCardProps {
  isOpen: boolean;
  onClose: () => void;
  staffData: StaffIDCardData | null;
}

// Color constants (hex values for html2canvas compatibility)
const COLORS = {
  ncosGreen900: "#064e3b",
  ncosGreen800: "#065f46",
  gold500: "#eab308",
  gold400: "#facc15",
  gold300: "#fde047",
  white: "#ffffff",
  slate300: "#cbd5e1",
  slate700: "#334155",
};

// Logo URL from public folder
const NCOS_LOGO_URL = "/logo.png";

export const StaffIDCard: React.FC<StaffIDCardProps> = ({
  isOpen,
  onClose,
  staffData,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [photoBase64, setPhotoBase64] = useState<string>("");

  useEffect(() => {
    if (staffData && isOpen) {
      const verificationUrl = `${window.location.origin}/staff/${staffData.service_no}`;

      // Generate QR code
      QRCode.toDataURL(verificationUrl, {
        width: 200,
        margin: 1,
        color: { dark: COLORS.ncosGreen900, light: COLORS.white },
        errorCorrectionLevel: "M",
      })
        .then((url: string) => {
          setQrCodeUrl(url);
        })
        .catch((err: unknown) => {
          console.error("Error generating QR code", err);
        });

      imageUrlToBase64(staffData.photo)
        .then((base64) => {
          setPhotoBase64(base64);
        })
        .catch((err: unknown) => {
          console.error("Error converting photo to base64", err);
        });
    }
  }, [staffData, isOpen]);

  if (!isOpen || !staffData) return null;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `NCoS_ID_${staffData.first_name}_${staffData.surname}_${staffData.service_no}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Failed to generate ID card image", err);
    }
    setIsDownloading(false);
  };

  const handlePrint = () => {
    if (!cardRef.current) return;

    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) {
      alert("Please allow popups to print the ID card");
      return;
    }

    const cardContent = cardRef.current.outerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>NCoS ID Card - ${staffData.first_name} ${staffData.surname}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: #f1f5f9;
              padding: 20px;
            }
            @media print {
              body { background: white; padding: 0; }
              @page { size: 85.6mm 54mm; margin: 0; }
            }
          </style>
        </head>
        <body>${cardContent}</body>
      </html>
    `);
    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 300);
    };
  };

  const fullName =
    `${staffData.surname} ${staffData.first_name} ${staffData.other_names || ""}`.trim();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "480px",
          padding: "24px",
          backgroundColor: COLORS.white,
          borderRadius: "16px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            padding: "8px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "transparent",
            cursor: "pointer",
            zIndex: 10,
          }}
        >
          <X style={{ width: "20px", height: "20px", color: "#475569" }} />
        </button>

        <h2
          style={{
            marginBottom: "20px",
            fontSize: "20px",
            fontWeight: "bold",
            color: "#0f172a",
          }}
        >
          Staff ID Card
        </h2>

        {/* ID Card Preview */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px",
            padding: "8px",
          }}
        >
          {/* ID Card - CR80 standard (3.375" x 2.125" = 85.6mm x 54mm) scaled */}
          <div
            ref={cardRef}
            style={{
              position: "relative",
              width: "380px",
              minWidth: "380px",
              height: "240px",
              background: `linear-gradient(135deg, ${COLORS.ncosGreen900} 0%, ${COLORS.ncosGreen800} 50%, ${COLORS.ncosGreen900} 100%)`,
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.3)",
              fontFamily:
                "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}
          >
            {/* Background pattern */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0.04,
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                backgroundSize: "16px 16px",
              }}
            />

            {/* Gold accent line at top */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4px",
                background: `linear-gradient(90deg, ${COLORS.gold500}, ${COLORS.gold300}, ${COLORS.gold500})`,
              }}
            />

            {/* Left section - Logo and Photo */}
            <div
              style={{
                position: "absolute",
                left: "16px",
                top: "16px",
                bottom: "16px",
                width: "130px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                zIndex: 10,
              }}
            >
              {/* Logo */}
              <img
                src={NCOS_LOGO_URL}
                alt="NCoS Logo"
                style={{
                  width: "50px",
                  height: "50px",
                  objectFit: "contain",
                  borderRadius: "4px",
                }}
                crossOrigin="anonymous"
              />

              {/* Photo */}
              <div
                style={{
                  marginTop: "8px",
                  width: "90px",
                  height: "100px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: `3px solid ${COLORS.gold500}`,
                  backgroundColor: COLORS.slate700,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                }}
              >
                {photoBase64 ? (
                  <img
                    src={photoBase64}
                    alt={fullName}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      height: "100%",
                      fontSize: "28px",
                      fontWeight: "bold",
                      color: COLORS.white,
                    }}
                  >
                    {staffData.first_name?.[0]}
                    {staffData.surname?.[0]}
                  </div>
                )}
              </div>
            </div>

            {/* Right section - Details */}
            <div
              style={{
                position: "absolute",
                left: "160px",
                right: "16px",
                top: "20px",
                bottom: "16px",
                display: "flex",
                flexDirection: "column",
                zIndex: 10,
              }}
            >
              {/* Header text */}
              <div style={{ textAlign: "center", marginBottom: "8px" }}>
                <p
                  style={{
                    fontSize: "8px",
                    fontWeight: "bold",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: COLORS.gold400,
                    margin: 0,
                  }}
                >
                  Federal Republic of Nigeria
                </p>
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: "bold",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: COLORS.white,
                    margin: "2px 0",
                  }}
                >
                  Nigerian Correctional Service
                </p>
                <p
                  style={{
                    fontSize: "9px",
                    fontWeight: "600",
                    color: COLORS.gold400,
                    margin: 0,
                  }}
                >
                  Staff Identity Card
                </p>
              </div>

              {/* Name */}
              <div
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  marginBottom: "6px",
                }}
              >
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: "bold",
                    color: COLORS.white,
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  {fullName}
                </p>
                <p
                  style={{
                    fontSize: "10px",
                    color: COLORS.gold400,
                    margin: "2px 0 0 0",
                    fontWeight: "600",
                  }}
                >
                  {staffData.present_rank || "Staff"}
                </p>
              </div>

              {/* Info grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "4px",
                  flex: 1,
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "7px",
                      color: COLORS.slate300,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      margin: 0,
                    }}
                  >
                    Service No
                  </p>
                  <p
                    style={{
                      fontSize: "11px",
                      fontWeight: "bold",
                      color: COLORS.white,
                      fontFamily: "monospace",
                      margin: 0,
                    }}
                  >
                    {staffData.service_no}
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "7px",
                      color: COLORS.slate300,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      margin: 0,
                    }}
                  >
                    IPPIS No
                  </p>
                  <p
                    style={{
                      fontSize: "11px",
                      fontWeight: "bold",
                      color: COLORS.white,
                      fontFamily: "monospace",
                      margin: 0,
                    }}
                  >
                    {staffData.ippis || "N/A"}
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "7px",
                      color: COLORS.slate300,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      margin: 0,
                    }}
                  >
                    Date of Birth
                  </p>
                  <p
                    style={{
                      fontSize: "11px",
                      fontWeight: "bold",
                      color: COLORS.white,
                      margin: 0,
                    }}
                  >
                    {staffData.dob
                      ? new Date(staffData.dob).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "N/A"}
                  </p>
                </div>
                {staffData.assigned_state_name && (
                  <div>
                    <p
                      style={{
                        fontSize: "7px",
                        color: COLORS.slate300,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        margin: 0,
                      }}
                    >
                      Command
                    </p>
                    <p
                      style={{
                        fontSize: "10px",
                        fontWeight: "600",
                        color: COLORS.white,
                        margin: 0,
                      }}
                    >
                      {staffData.assigned_state_name}
                    </p>
                  </div>
                )}
              </div>

              {/* QR Code */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  marginTop: "auto",
                }}
              >
                <p
                  style={{
                    fontSize: "6px",
                    color: COLORS.slate300,
                    maxWidth: "100px",
                    lineHeight: 1.3,
                    margin: 0,
                  }}
                >
                  Scan QR to verify.
                  <br />
                  Property of FGN.
                </p>
                {qrCodeUrl && (
                  <div
                    style={{
                      padding: "4px",
                      backgroundColor: COLORS.white,
                      borderRadius: "6px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    }}
                  >
                    <img
                      src={qrCodeUrl}
                      alt="QR Code"
                      style={{
                        width: "50px",
                        height: "50px",
                        display: "block",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Gold accent line at bottom */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "4px",
                background: `linear-gradient(90deg, ${COLORS.gold500}, ${COLORS.gold300}, ${COLORS.gold500})`,
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "12px" }}>
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            {isDownloading ? "Processing..." : "Download PNG"}
          </Button>
          <Button
            onClick={handlePrint}
            className="flex-1 bg-ncos-green-900 hover:bg-ncos-green-800"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Card
          </Button>
        </div>
      </div>
    </div>
  );
};
