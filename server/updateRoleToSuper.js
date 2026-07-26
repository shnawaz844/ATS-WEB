import supabase from './config/supabaseClient.js';

const update = async () => {
  try {
    const { data: u1, error: e1 } = await supabase
      .from('users')
      .update({ role: 'super' })
      .eq('email', 'karamveer@gmail.com')
      .select();

    if (e1) {
      console.error('Error updating karamveer@gmail.com:', e1.message);
    } else {
      console.log('✅ Successfully updated karamveer@gmail.com to role: "super"');
    }

    const { data: u2, error: e2 } = await supabase
      .from('users')
      .update({ role: 'super' })
      .eq('email', 'shahnawaz95577@gmail.com')
      .select();

    if (e2) {
      console.error('Error updating shahnawaz95577@gmail.com:', e2.message);
    } else {
      console.log('✅ Successfully updated shahnawaz95577@gmail.com to role: "super"');
    }
  } catch (err) {
    console.error(err);
  }
};

update();
