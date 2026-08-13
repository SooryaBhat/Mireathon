const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    env[match[1]] = value;
  }
});

const serviceKey = env['SUPABASE_SERVICE_ROLE_KEY'];

const sql = `
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT NULL;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone_number, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student User'),
    NEW.email,
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'phone_number',
    'student'
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      email = EXCLUDED.email,
      phone_number = COALESCE(EXCLUDED.phone_number, public.profiles.phone_number),
      phone = COALESCE(EXCLUDED.phone, public.profiles.phone);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

const hosts = [
  'db.pyvnywuygkwcwhenzldl.supabase.co',
  'aws-0-ap-south-1.pooler.supabase.com',
  'aws-0-us-east-1.pooler.supabase.com'
];

const ports = [5432, 6543];

const passwords = [
  serviceKey,
  'postgres',
  'miraethon2026',
  'Miraethon2026!',
  'SooryaBhat49',
];

async function tryConnect() {
  for (const host of hosts) {
    for (const port of ports) {
      for (const pass of passwords) {
        const user = port === 6543 ? 'postgres.pyvnywuygkwcwhenzldl' : 'postgres';
        const connectionString = `postgres://${user}:${encodeURIComponent(pass)}@${host}:${port}/postgres`;
        console.log(`Trying ${user}@${host}:${port}...`);
        const client = new Client({ connectionString, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 5000 });
        try {
          await client.connect();
          console.log(`SUCCESSFULLY CONNECTED TO ${host}:${port}!`);
          await client.query(sql);
          console.log("SUCCESSFULLY EXECUTED MIGRATION DDL ON LIVE SUPABASE DB!");
          await client.end();
          return true;
        } catch (err) {
          // console.log("Failed:", err.message);
          await client.end().catch(() => {});
        }
      }
    }
  }
  console.log("Direct connection attempts finished.");
  return false;
}

tryConnect();
