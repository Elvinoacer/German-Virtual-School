import { NextRequest, NextResponse } from "next/server";
import { sendEmailNotification } from "@/lib/notifications/channels/email";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, message } = await req.json();

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "Name, email, and phone are required." },
        { status: 400 }
      );
    }

    const adminEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@germanvirtualschool.com';

    // Send email to admin
    await sendEmailNotification({
      userId: 'system',
      title: 'New Marketer Partner Request',
      message: `A new request to join the Partner Program has been submitted by ${name}.`,
      email: {
        to: adminEmail,
        subject: `🤝 New Marketer Request: ${name}`,
        html: `
          <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a4d8f;">New Marketer Request</h1>
            <p>A new user has requested to join the Marketer Partner Program.</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; width: 30%;">Name</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Email</td>
                <td style="padding: 10px; border: 1px solid #ddd;">
                  <a href="mailto:${email}">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Phone</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${phone}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Strategy / Message</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${message || 'N/A'}</td>
              </tr>
            </table>
            
            <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin-top: 30px;">
              <p style="margin: 0; font-size: 14px;">
                <strong>Next Steps:</strong> Review this applicant and reply directly to their email if you wish to proceed. Once vetted, you can create their account from the 
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/marketers" style="color: #1a4d8f;">Admin Dashboard</a>.
              </p>
            </div>
          </div>
        `,
      },
    });

    return NextResponse.json({ success: true, message: "Request sent successfully." }, { status: 200 });
  } catch (error) {
    console.error("Marketer join request error:", error);
    return NextResponse.json(
      { error: "Failed to process the request. Please try again later." },
      { status: 500 }
    );
  }
}
