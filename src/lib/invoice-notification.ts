import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { notify } from './notifications/orchestrator';
import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';

interface InvoiceData {
  id: string;
  amount: number;
  description: string;
  dueDate: Date;
  createdAt: Date;
  studentName: string;
  studentEmail: string;
  studentId?: string; // Needed for notify(userId)
}

export async function generateInvoicePDF(invoice: InvoiceData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const fontSize = 12;
  const margin = 50;
  let yPosition = height - margin;

  // 1. Logo (Load from public/gvs-logo.png)
  try {
    const logoPath = path.join(process.cwd(), 'public', 'gvs-logo.png');
    if (fs.existsSync(logoPath)) {
      const logoImage = fs.readFileSync(logoPath);
      const logo = await pdfDoc.embedPng(logoImage);
      // Scale logo to fit reasonable height (e.g. 60px)
      const logoDims = logo.scale(0.2); 
      page.drawImage(logo, {
        x: margin,
        y: yPosition - logoDims.height,
        width: logoDims.width,
        height: logoDims.height,
      });
      yPosition -= (logoDims.height + 20);
    } else {
      console.warn('Logo not found at', logoPath);
      yPosition -= 40;
    }
  } catch (err) {
    console.error('Error loading logo for PDF:', err);
    yPosition -= 40;
  }

  // 2. Header
  page.drawText('German Virtual School', { x: margin, y: yPosition, size: 20, font: fontBold, color: rgb(0, 0, 0) });
  yPosition -= 30;
  
  page.drawText('INVOICE', { x: margin, y: yPosition, size: 18, font: fontBold, color: rgb(0.2, 0.4, 0.6) });
  // Add invoice status or number on the right
  page.drawText(`Reference: #${invoice.id.split('-')[0].toUpperCase()}`, { 
    x: width - margin - 150, 
    y: yPosition, 
    size: 10, 
    font: font, 
    color: rgb(0.5, 0.5, 0.5) 
  });
  yPosition -= 40;

  // 3. Bill To
  page.drawText('Bill To:', { x: margin, y: yPosition, size: 10, font: fontBold });
  yPosition -= 15;
  page.drawText(invoice.studentName, { x: margin, y: yPosition, size: 12, font: font });
  yPosition -= 15;
  page.drawText(invoice.studentEmail, { x: margin, y: yPosition, size: 10, font: font, color: rgb(0.5, 0.5, 0.5) });
  
  // Date details on the right
  page.drawText('Date Issued:', { x: width - margin - 150, y: yPosition + 15, size: 10, font: fontBold });
  page.drawText(format(new Date(invoice.createdAt), 'MMM dd, yyyy'), { x: width - margin - 80, y: yPosition + 15, size: 10, font: font });
  
  page.drawText('Due Date:', { x: width - margin - 150, y: yPosition, size: 10, font: fontBold });
  page.drawText(format(new Date(invoice.dueDate), 'MMM dd, yyyy'), { x: width - margin - 80, y: yPosition, size: 10, font: font, color: rgb(0.8, 0, 0) });

  yPosition -= 50;

  // 4. Line Items Table Header
  page.drawRectangle({
    x: margin,
    y: yPosition - 5,
    width: width - (margin * 2),
    height: 25,
    color: rgb(0.95, 0.95, 0.95),
  });
  
  page.drawText('Description', { x: margin + 10, y: yPosition + 4, size: 10, font: fontBold });
  page.drawText('Amount (KES)', { x: width - margin - 100, y: yPosition + 4, size: 10, font: fontBold });
  
  yPosition -= 30;

  // 5. Line Item
  page.drawText(invoice.description, { x: margin + 10, y: yPosition, size: 10, font: font, maxWidth: 300 });
  page.drawText(invoice.amount.toLocaleString(), { x: width - margin - 100, y: yPosition, size: 10, font: font });
  
  yPosition -= 20;
  
  // Divider
  page.drawLine({
    start: { x: margin, y: yPosition },
    end: { x: width - margin, y: yPosition },
    thickness: 1,
    color: rgb(0.9, 0.9, 0.9),
  });
  yPosition -= 30;

  // 6. Total
  page.drawText('Total Amount Due:', { x: width - margin - 220, y: yPosition, size: 12, font: fontBold });
  page.drawText(`KES ${invoice.amount.toLocaleString()}`, { 
    x: width - margin - 100, 
    y: yPosition, 
    size: 14, 
    font: fontBold, 
    color: rgb(0, 0.5, 0.2) 
  });

  // 7. Footer
  const footerY = 50;
  page.drawLine({
    start: { x: margin, y: footerY + 20 },
    end: { x: width - margin, y: footerY + 20 },
    thickness: 1,
    color: rgb(0.9, 0.9, 0.9),
  });
  
  page.drawText('Payment allows access to the German Virtual School dashboard.', { x: margin, y: footerY, size: 8, font: font, color: rgb(0.6, 0.6, 0.6) });
  page.drawText('Thank you for learning with us.', { x: margin, y: footerY - 10, size: 8, font: font, color: rgb(0.6, 0.6, 0.6) });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export async function sendInvoiceNotification(invoice: InvoiceData) {
  try {
    if (!invoice.studentId) {
        console.warn('⚠️ Invoice data missing studentId, skipping notification');
        return;
    }

    console.log(`📄 Generating PDF for invoice ${invoice.id}...`);
    const pdfBuffer = await generateInvoicePDF(invoice);

    const title = 'New Invoice Generated';
    const message = `A new invoice for ${invoice.description} (KES ${invoice.amount.toLocaleString()}) has been generated.`;

    console.log(`📣 Notifying student ${invoice.studentEmail}...`);
    
    await notify({
      userId: invoice.studentId,
      type: 'PAYMENT',
      title,
      message,
      email: {
        to: invoice.studentEmail,
        html: `
          <div style="font-family: sans-serif; color: #333;">
            <h1>${title}</h1>
            <p>Dear ${invoice.studentName},</p>
            <p>${message}</p>
            <p><strong>Amount:</strong> KES ${invoice.amount.toLocaleString()}</p>
            <p><strong>Due Date:</strong> ${format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</p>
            
            <p>Please find the invoice attached as a PDF. You can also view and pay this invoice directly from your <a href="${process.env.NEXT_PUBLIC_APP_URL}/student/billing">Student Dashboard</a>.</p>
            
            <br>
            <p>Best regards,</p>
            <p>German Virtual School Finance Team</p>
          </div>
        `,
        attachments: [
          {
            filename: `Invoice-${invoice.id.split('-')[0]}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      },
      push: {
        // Will auto-fetch tokens if not provided, just need to trigger it
        data: {
            url: '/student/billing'
        }
      }
    });
    console.log('✅ Invoice notification dispatched via orchestrator.');
  } catch (error) {
    console.error('❌ Failed to send invoice notification:', error);
  }
}

