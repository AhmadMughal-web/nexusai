// test.mjs — Run this: node test.mjs
// Yeh script check karega ke kya kaam kar raha hai aur kya nahi
import 'dotenv/config';
import axios from 'axios';

console.log('\n🔍 NexusAI Diagnostic Tool\n');

// 1. Check env vars
console.log('1️⃣  Environment Variables:');
console.log('   PORT:', process.env.PORT || '5000 (default)');
console.log('   GROQ_API_KEY:', process.env.GROQ_API_KEY ? `✅ Set (${process.env.GROQ_API_KEY.slice(0,8)}...)` : '❌ NOT SET');
console.log('   MONGO_URI:', process.env.MONGO_URI ? `✅ Set` : '⚡ Not set (in-memory mode)');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ NOT SET');
console.log('');

// 2. Test Groq API
console.log('2️⃣  Testing Groq API...');
const key = process.env.GROQ_API_KEY;

if (!key || key === 'your_groq_api_key_here' || key.length < 20) {
  console.log('   ❌ GROQ_API_KEY is missing or invalid in .env file!');
  console.log('   Get your key from: https://console.groq.com\n');
  process.exit(1);
}

try {
  const res = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: 'Say "ok" in one word.' }],
      max_tokens: 10,
    },
    {
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      timeout: 15000,
    }
  );
  const reply = res.data?.choices?.[0]?.message?.content;
  console.log(`   ✅ Groq API working! Response: "${reply}"`);
} catch (err) {
  if (err.response) {
    console.log(`   ❌ Groq API Error ${err.response.status}: ${err.response.data?.error?.message}`);
  } else {
    console.log(`   ❌ Network Error: ${err.code} — ${err.message}`);
  }
}

console.log('\n✅ Diagnostic complete!\n');
