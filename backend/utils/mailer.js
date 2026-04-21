import nodemailer from 'nodemailer';

export async function sendResetEmail(to, name, resetURL) {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  // Dev mode: sirf console mein print karo
  if (!user || user.includes('your_email') || !pass || pass.length < 10) {
    console.log('\n📧 ─── PASSWORD RESET LINK (DEV MODE) ───────────────');
    console.log(`   To: ${to}`);
    console.log(`   Link: ${resetURL}`);
    console.log('─────────────────────────────────────────────────────\n');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });

  // Connection verify
  try {
    await transporter.verify();
  } catch (err) {
    console.error('❌ Email server connection failed:', err.message);
    console.log(`   Reset link (use manually): ${resetURL}`);
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `NexusAI <${user}>`,
    to,
    subject: '🔑 Reset Your NexusAI Password',
    html: `
      <div style="max-width:520px;margin:40px auto;font-family:sans-serif;background:#111827;border-radius:20px;border:1px solid rgba(59,130,246,0.2);overflow:hidden;">
        <div style="background:linear-gradient(135deg,#3b82f6,#06b6d4);padding:28px;text-align:center;">
          <div style="width:52px;height:52px;background:rgba(255,255,255,0.2);border-radius:14px;display:inline-flex;align-items:center;justify-content:center;font-size:26px;font-weight:900;color:white;margin-bottom:10px;">N</div>
          <h1 style="color:white;margin:0;font-size:22px;font-weight:800;">NexusAI</h1>
        </div>
        <div style="padding:28px;">
          <h2 style="color:#e8f0fe;font-size:18px;margin:0 0 12px;">Hi ${name}, reset your password</h2>
          <p style="color:#8ba3c4;line-height:1.6;margin:0 0 24px;">
            Click below to reset your password. This link expires in <strong style="color:#3b82f6;">15 minutes</strong>.
          </p>
          <a href="${resetURL}" style="display:block;text-align:center;background:linear-gradient(135deg,#3b82f6,#06b6d4);color:white;text-decoration:none;padding:14px;border-radius:10px;font-weight:700;font-size:15px;margin-bottom:20px;">
            Reset My Password →
          </a>
          <p style="color:#4a6380;font-size:12px;margin:0;">If you didn't request this, ignore this email.</p>
        </div>
      </div>
    `,
  });

  console.log(`✅ Password reset email sent to ${to}`);
}
