import nodemailer from 'nodemailer';

export async function sendResetEmail(to, name, resetURL) {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  // Dev mode — print to console
  if (!user || user.includes('your_email') || !pass || pass.length < 8) {
    console.log('\n📧 ══ RESET LINK (copy karo browser mein) ════════════');
    console.log(`   ${resetURL}`);
    console.log('═══════════════════════════════════════════════════\n');
    return;
  }

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });

  await transport.sendMail({
    from: `NexusAI <${user}>`,
    to,
    subject: '🔑 Reset Your NexusAI Password',
    html: `<div style="font-family:sans-serif;max-width:500px;margin:auto;padding:32px;background:#111827;border-radius:16px;color:#e8f0fe">
      <h2 style="color:#3b82f6">Reset Password</h2>
      <p>Hi ${name}, click below to reset your password. Link expires in <b>15 minutes</b>.</p>
      <a href="${resetURL}" style="display:inline-block;margin:20px 0;padding:14px 28px;background:linear-gradient(135deg,#3b82f6,#06b6d4);color:#fff;border-radius:10px;text-decoration:none;font-weight:bold">
        Reset My Password →
      </a>
      <p style="color:#4a6380;font-size:12px">If you didn't request this, ignore this email.</p>
    </div>`,
  });
  console.log(`✅ Reset email sent to ${to}`);
}
