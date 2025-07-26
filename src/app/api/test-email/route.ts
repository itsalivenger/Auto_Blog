import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email-service'

export async function GET(request: NextRequest) {
  try {
    const testEmailRecipient = process.env.ADMIN_EMAIL || 'your-test-email@example.com'; // Use ADMIN_EMAIL or a fallback

    if (!testEmailRecipient || testEmailRecipient === 'your-test-email@example.com') {
      return NextResponse.json({ error: 'Please configure ADMIN_EMAIL in your .env file or provide a valid test email.' }, { status: 400 });
    }

    await sendEmail({
      to: testEmailRecipient,
      subject: 'Test Email from Auto-Blogger',
      html: `
        <p>This is a test email sent from your Auto-Blogger application.</p>
        <p>If you received this, your email configuration is working!</p>
        <p>Best regards,</p>
        <p>Your Auto-Blogger Test System</p>
      `,
    });

    return NextResponse.json({ message: 'Test email sent successfully!' }, { status: 200 });
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send test email' },
      { status: 500 }
    );
  }
}
