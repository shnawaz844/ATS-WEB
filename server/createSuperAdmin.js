import supabase from './config/supabaseClient.js';
import bcrypt from 'bcryptjs';

const createSuperAdmin = async () => {
  try {
    const rawPassword = 'Nawaz123#';
    const hashPassword = bcrypt.hashSync(rawPassword, 10);

    const superAdminData = {
      userName: 'Super Admin',
      email: 'admin@ats.com',
      password: hashPassword,
      gender: 'Male',
      address: 'Main Office',
      role: 'super',
      head: true,
      company_id: 'super'
    };

    // Check if admin@ats.com exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@ats.com')
      .maybeSingle();

    if (existingUser) {
      const { data, error } = await supabase
        .from('users')
        .update({
          password: hashPassword,
          role: 'super',
          head: true,
          company_id: 'super',
          updatedAt: new Date().toISOString()
        })
        .eq('email', 'admin@ats.com')
        .select()
        .single();

      if (error) {
        console.error('Error updating admin@ats.com:', error);
      } else {
        console.log('✅ Updated Super Admin user: admin@ats.com');
      }
    } else {
      const { data, error } = await supabase
        .from('users')
        .insert(superAdminData)
        .select()
        .single();

      if (error) {
        console.error('Error creating admin@ats.com:', error);
      } else {
        console.log('✅ Created Super Admin user: admin@ats.com');
      }
    }

    // Also update shahnawaz95577@gmail.com to super admin if it exists
    const { data: userShnawaz } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'shahnawaz95577@gmail.com')
      .maybeSingle();

    if (userShnawaz) {
      await supabase
        .from('users')
        .update({
          password: hashPassword,
          role: 'super',
          head: true,
          company_id: 'super',
          updatedAt: new Date().toISOString()
        })
        .eq('email', 'shahnawaz95577@gmail.com');
      console.log('✅ Updated Super Admin user: shahnawaz95577@gmail.com');
    }

    // Also update karamveer@gmail.com to super admin if it exists
    const { data: userKaramveer } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'karamveer@gmail.com')
      .maybeSingle();

    if (userKaramveer) {
      await supabase
        .from('users')
        .update({
          password: hashPassword,
          role: 'super',
          head: true,
          company_id: 'super',
          updatedAt: new Date().toISOString()
        })
        .eq('email', 'karamveer@gmail.com');
      console.log('✅ Updated Super Admin user: karamveer@gmail.com');
    } else {
      await supabase
        .from('users')
        .insert({
          userName: 'Karamveer Singh',
          email: 'karamveer@gmail.com',
          password: hashPassword,
          gender: 'Male',
          address: 'Bareilly',
          role: 'super',
          head: true,
          company_id: 'super'
        });
      console.log('✅ Created Super Admin user: karamveer@gmail.com');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Failed:', err);
    process.exit(1);
  }
};

createSuperAdmin();
