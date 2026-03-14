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
  page.drawText('Amount (USD)', { x: width - margin - 100, y: yPosition + 4, size: 10, font: fontBold });
  
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
  page.drawText(`$${invoice.amount.toLocaleString()}`, { 
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
    const message = `A new invoice for ${invoice.description} ($${invoice.amount.toLocaleString()}) has been generated.`;

    console.log(`📣 Notifying student ${invoice.studentEmail}...`);
    
    await notify({
      userId: invoice.studentId,
      type: 'PAYMENT',
      title,
      message,
      email: {
        to: invoice.studentEmail,
        subject: `💳 Invoice #${invoice.id.split('-')[0].toUpperCase()} - $${invoice.amount.toLocaleString()}`,
        html: `
          <div style="margin-bottom: 24px;">
            <h1 style="color: #1a1a2e; font-size: 24px; font-weight: 700; margin: 0 0 8px 0;">
              New Invoice Generated
            </h1>
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              Reference: #${invoice.id.split('-')[0].toUpperCase()}
            </p>
          </div>
          
          <p style="color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Dear <strong>${invoice.studentName}</strong>,
          </p>
          
          <p style="color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            A new invoice has been generated for your German Virtual School account.
          </p>
          
          <!-- Amount Card -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 32px; margin-bottom: 24px; text-align: center;">
            <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">
              Amount Due
            </p>
            <p style="color: #ffffff; font-size: 36px; font-weight: 700; margin: 0;">
              $${invoice.amount.toLocaleString()}
            </p>
          </div>
          
          <!-- Details -->
          <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; color: #64748b; font-size: 14px; border-bottom: 1px solid #e2e8f0;">Description</td>
                <td style="padding: 12px 0; color: #1a1a2e; font-size: 14px; font-weight: 600; text-align: right; border-bottom: 1px solid #e2e8f0;">${invoice.description}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #64748b; font-size: 14px; border-bottom: 1px solid #e2e8f0;">Issue Date</td>
                <td style="padding: 12px 0; color: #1a1a2e; font-size: 14px; font-weight: 600; text-align: right; border-bottom: 1px solid #e2e8f0;">${format(new Date(invoice.createdAt), 'MMM dd, yyyy')}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #64748b; font-size: 14px;">Due Date</td>
                <td style="padding: 12px 0; text-align: right;">
                  <span style="display: inline-block; background-color: #fef2f2; color: #dc2626; font-size: 14px; font-weight: 600; padding: 4px 12px; border-radius: 6px;">
                    ${format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                  </span>
                </td>
              </tr>
            </table>
          </div>
          
          <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
            📎 The invoice PDF is attached to this email for your records.
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/student/billing" 
               style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.35);">
              Pay Now →
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 14px; line-height: 1.6; text-align: center;">
            Questions about this invoice? Contact us at <a href="mailto:${process.env.ACCOUNTS_EMAIL || 'accounts@germanvirtualschool.com'}" style="color: #667eea;">${process.env.ACCOUNTS_EMAIL || 'accounts@germanvirtualschool.com'}</a>
          </p>
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

