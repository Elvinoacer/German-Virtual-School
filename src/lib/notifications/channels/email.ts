
import "server-only";
import { Resend } from "resend";
import { NotificationPayload, ChannelResult } from "../types";

export const runtime = "nodejs";

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Default from email - uses ACCOUNTS_EMAIL for transactional emails
const DEFAULT_FROM_EMAIL = process.env.ACCOUNTS_EMAIL || "no-reply@germanvirtualschool.com";
const DEFAULT_FROM_NAME = process.env.NEXT_PUBLIC_APP_NAME || "German Virtual School";

/**
 * Premium HTML email wrapper with German Virtual School branding
 * Creates a beautiful, responsive email template
 */
function wrapWithPremiumTemplate(content: string, title?: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title || 'German Virtual School'}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset styles */
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      outline: none;
      text-decoration: none;
    }
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
    }
    
    /* Typography */
    .email-body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', Arial, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: #1a1a2e;
    }
    
    /* Links */
    a {
      color: #0d6efd;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    
    /* Button styles */
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff !important;
      text-decoration: none !important;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.35);
      transition: all 0.3s ease;
    }
    
    /* Responsive */
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
        padding: 20px !important;
      }
      .content {
        padding: 24px !important;
      }
      .header {
        padding: 24px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7fa;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f7fa;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" align="center" class="container" style="max-width: 600px; margin: 0 auto;">
          
          <!-- Header -->
          <tr>
            <td class="header" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 32px 40px; border-radius: 16px 16px 0 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td>
                    <img src="${process.env.NEXT_PUBLIC_APP_URL || 'https://germanvirtualschool.com'}/gvs-logo.png" alt="German Virtual School" height="50" style="height: 50px; width: auto; display: block;">
                  </td>
                  <td align="right" style="color: #a0aec0; font-size: 13px;">
                    Premium German Education
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td class="content" style="background-color: #ffffff; padding: 40px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">
              <div class="email-body">
                ${content}
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 32px 40px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0; border-top: none;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 16px 0; color: #64748b; font-size: 14px;">
                      Learn German with excellence. Anytime, anywhere.
                    </p>
                    <p style="margin: 0 0 16px 0;">
                      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://germanvirtualschool.com'}" style="color: #667eea; font-weight: 500; font-size: 14px;">
                        Visit German Virtual School →
                      </a>
                    </p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                    <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                      © ${new Date().getFullYear()} German Virtual School. All rights reserved.
                    </p>
                    <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 12px;">
                      Questions? Contact us at <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@germanvirtualschool.com'}" style="color: #667eea;">${process.env.SUPPORT_EMAIL || 'support@germanvirtualschool.com'}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Send email notification using Resend
 */
export async function sendEmailNotification(payload: NotificationPayload): Promise<ChannelResult> {
  const { email } = payload;
  
  if (!email || !email.to) {
    return { success: false, error: "Missing email destination" };
  }

  // Check if API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.error("[Email] RESEND_API_KEY not configured");
    return { success: false, error: "Email service not configured" };
  }

  try {
    // Determine the content - wrap with premium template if HTML is provided
    let htmlContent = email.html;
    if (htmlContent) {
      // Wrap existing HTML with premium template for consistent branding
      htmlContent = wrapWithPremiumTemplate(htmlContent, email.subject || payload.title);
    }

    // Prepare attachments for Resend format
    const attachments = email.attachments?.map((att) => ({
      filename: att.filename,
      content: att.content instanceof Buffer ? att.content : Buffer.from(att.content),
    }));

    const { data, error } = await resend.emails.send({
      from: `${DEFAULT_FROM_NAME} <${DEFAULT_FROM_EMAIL}>`,
      to: Array.isArray(email.to) ? email.to : [email.to],
      subject: email.subject || payload.title,
      text: email.text || payload.message,
      html: htmlContent,
      attachments,
    });

    if (error) {
      console.error("[Email] Resend error:", error);
      return { success: false, error: error.message };
    }

    console.log(`[Email] Sent to ${email.to} (ID: ${data?.id})`);
    return { success: true, message: `Email sent with ID: ${data?.id}` };
  } catch (error: any) {
    console.error("[Email] Failed:", error);
    return { success: false, error: error.message };
  }
}
