-- Migration: Add nullable phone_number column to public.profiles and update trigger
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT NULL;

-- Also ensure legacy phone column exists as nullable if referenced
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT NULL;

-- Update trigger function to handle new user registration metadata
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
