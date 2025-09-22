import jsPDF from 'jspdf';

interface CertificateData {
  fullName: string;
  nim: string;
  major: string;
  sessionTest: string;
  testDate: Date | string;
  listening: number;
  swe: number;
  reading: number;
  scoreTotal: number;
  qrCode: string;
}

export const generateCertificatePDF = async (data: CertificateData): Promise<Blob> => {
  const pdf = new jsPDF('portrait', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Set colors
  const primaryBlue = '#2563eb';
  const lightBlue = '#dbeafe';
  
  // Add border
  pdf.setDrawColor(37, 99, 235);
  pdf.setLineWidth(2);
  pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // Header background
  pdf.setFillColor(219, 234, 254);
  pdf.rect(15, 15, pageWidth - 30, 40, 'F');

  // Logo/Icon placeholder (could be replaced with actual logo)
  pdf.setFillColor(37, 99, 235);
  pdf.circle(35, 35, 8, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.text('T', 32, 38);

  // Title
  pdf.setTextColor(37, 99, 235);
  pdf.setFontSize(24);
  pdf.text('TOEFL CERTIFICATE', pageWidth / 2, 30, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.text('Test of English as a Foreign Language', pageWidth / 2, 40, { align: 'center' });

  // Certificate content
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(14);
  
  let yPosition = 80;
  
  pdf.text('This is to certify that', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;
  
  // Participant name (larger font)
  pdf.setFontSize(20);
  pdf.setTextColor(37, 99, 235);
  pdf.text(data.fullName.toUpperCase(), pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;
  
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text('has successfully completed the TOEFL examination', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  // Participant details
  const leftColumn = 30;
  const rightColumn = pageWidth / 2 + 20;
  
  pdf.setFontSize(12);
  pdf.text('Student ID:', leftColumn, yPosition);
  pdf.text(data.nim, leftColumn + 25, yPosition);
  
  pdf.text('Test Date:', rightColumn, yPosition);
  const testDate = new Date(data.testDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  pdf.text(testDate, rightColumn + 25, yPosition);
  yPosition += 10;
  
  pdf.text('Major:', leftColumn, yPosition);
  pdf.text(data.major, leftColumn + 25, yPosition);
  
  pdf.text('Session:', rightColumn, yPosition);
  pdf.text(data.sessionTest, rightColumn + 25, yPosition);
  yPosition += 20;

  // Scores section
  pdf.setFillColor(248, 250, 252);
  pdf.rect(25, yPosition - 5, pageWidth - 50, 40, 'F');
  
  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(0.5);
  pdf.rect(25, yPosition - 5, pageWidth - 50, 40);
  
  pdf.setFontSize(14);
  pdf.setTextColor(37, 99, 235);
  pdf.text('TOEFL SCORES', pageWidth / 2, yPosition + 5, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  yPosition += 15;
  
  const scoreLeftCol = 40;
  const scoreRightCol = pageWidth / 2 + 10;
  
  pdf.text(`Listening: ${data.listening}`, scoreLeftCol, yPosition);
  pdf.text(`Reading: ${data.reading}`, scoreRightCol, yPosition);
  yPosition += 8;
  
  pdf.text(`Structure & Written Expression: ${data.swe}`, scoreLeftCol, yPosition);
  yPosition += 12;
  
  // Total score (prominent)
  pdf.setFontSize(16);
  pdf.setTextColor(37, 99, 235);
  pdf.text(`TOTAL SCORE: ${data.scoreTotal}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 25;

  // QR Code
  if (data.qrCode) {
    try {
      // Convert base64 QR code to image
      const qrSize = 30;
      const qrX = pageWidth - 45;
      const qrY = yPosition;
      
      pdf.addImage(data.qrCode, 'PNG', qrX, qrY, qrSize, qrSize);
      
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Scan to verify', qrX + qrSize/2, qrY + qrSize + 5, { align: 'center' });
    } catch (error) {
      console.error('Error adding QR code to PDF:', error);
    }
  }

  // Certificate ID/Hash
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Certificate ID: ${data.fullName.replace(/\s/g, '')}_${data.nim}_${Date.now()}`, 25, yPosition + 35);

  // Footer
  const footerY = pageHeight - 30;
  pdf.setFontSize(10);
  pdf.setTextColor(37, 99, 235);
  pdf.text('TOEFL Verification System', pageWidth / 2, footerY, { align: 'center' });
  
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Blockchain-verified certificate', pageWidth / 2, footerY + 5, { align: 'center' });
  pdf.text(`Generated on ${new Date().toLocaleDateString('en-US')}`, pageWidth / 2, footerY + 10, { align: 'center' });

  // Return as blob
  return pdf.output('blob');
};