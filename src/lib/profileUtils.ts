import { supabase } from '../lib/supabaseClient'
export const createProfile = async (userId: string, profileData: {
    firstname: string;
    lastname: string;
    nickname: string;
    contact_phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    profile_pic_url: string;
    latitude: number;
    longitude: number;
    isFarmer: boolean;
  }) => {
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          firstname: profileData.firstname,
          lastname: profileData.lastname,
          nickname: profileData.nickname,
          contact_phone: profileData.contact_phone,
          address: profileData.address,
          city: profileData.city,
          state: profileData.state,
          zip: profileData.zip,
          country: profileData.country,
          profile_pic_url: profileData.profile_pic_url,
          location: `POINT(${profileData.latitude} ${profileData.longitude})`,
        },
      ]);
  
    if (error) {
      console.error('Error creating profile:', error);
      throw error;
    }


    // Assign the appropriate role based on the user's selection
    const roleId = profileData.isFarmer ? 1 : null;
    if (roleId) {
        await assignRole(userId, roleId);
    }

    return data;
    };

export const assignRole = async (userId: string, roleId: number) => {
  const { data, error } = await supabase
    .from('user_roles')
    .insert([{ user_id: userId, role_id: roleId }]);

  if (error) {
    console.error('Error assigning role:', error);
    throw error;
  }

  return data;
};

export const profileExists = async (userId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId);
  
    if (error) {
      console.error('Error checking profile existence:', error);
      throw error;
    }
  
    return data.length > 0;
  };