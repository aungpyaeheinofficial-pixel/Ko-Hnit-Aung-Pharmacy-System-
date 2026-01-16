require('dotenv').config();

console.log('=== Environment Check ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'MISSING');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? `SET (length: ${process.env.JWT_SECRET.length})` : 'MISSING');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is missing!');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is missing!');
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 16) {
  console.error(`❌ JWT_SECRET is too short! Must be at least 16 characters, got ${process.env.JWT_SECRET.length}`);
  process.exit(1);
}

console.log('✅ All environment variables are set correctly!');

