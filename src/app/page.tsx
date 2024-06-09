'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { createProfile } from '../lib/profileUtils';
import { profileExists } from '../lib/profileUtils';

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [isProfileCreated, setIsProfileCreated] = useState(false);
  const [isFarmer, setIsFarmer] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    nickname: '',
    contact_phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    profile_pic_url: '',
    latitude: 0,
    longitude: 0,
  });


  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const checkProfileExists = async () => {
      if (session?.user) {
        const userId = session.user.id;
        const exists = await profileExists(userId);
        setIsProfileCreated(exists);
      }
    };

    checkProfileExists();
  }, [session]);



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCreateProfile = async () => {
    if (session?.user) {
      try {
        const userId = session.user.id;
        await createProfile(userId, {
          ...formData,
          isFarmer,
        });
        setIsProfileCreated(true);
        console.log('Profile created successfully');
      } catch (error) {
        console.error('Error creating profile:', error);
      }
    }
  };

  return (
    <div>
      <h1>Welcome to Supabase Auth</h1>
      {!session ? (
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google']}
        />
      ) : (
        <div>
          <p>Welcome, {session.user.email}!</p>
          {!isProfileCreated ? (
            <div>
              <p>Please choose your role:</p>
              <button onClick={() => setIsFarmer(true)}>Farmer</button>
              <button onClick={() => setIsFarmer(false)}>Buyer</button>
              {!isFarmer && (
                <div>
                  <h2>Create Your Profile</h2>
                  <form>
                    <label>
                      First Name:
                      <input
                        type="text"
                        name="firstname"
                        value={formData.firstname}
                        onChange={handleInputChange}
                      />
                    </label>
                    <label>
                      Last Name:
                      <input
                        type="text"
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleInputChange}
                      />
                    </label>
                    <label>
                      Nickname:
                      <input
                        type="text"
                        name="nickname"
                        value={formData.nickname}
                        onChange={handleInputChange}
                      />
                    </label>
                    <label>
                      Contact Phone:
                      <input
                        type="text"
                        name="contact_phone"
                        value={formData.contact_phone}
                        onChange={handleInputChange}
                      />
                    </label>
                    <label>
                      Address:
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                      />
                    </label>
                    <label>
                      City:
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                      />
                    </label>
                    <label>
                      State:
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                      />
                    </label>
                    <label>
                      Zip:
                      <input
                        type="text"
                        name="zip"
                        value={formData.zip}
                        onChange={handleInputChange}
                      />
                    </label>
                    <label>
                      Country:
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                      />
                    </label>
                    <label>
                      Profile Picture URL:
                      <input
                        type="text"
                        name="profile_pic_url"
                        value={formData.profile_pic_url}
                        onChange={handleInputChange}
                      />
                    </label>
                  </form>
                </div>
              )}
              <button onClick={handleCreateProfile}>Create Profile</button>
            </div>
          ) : (
            <p>Profile created!</p>
          )}
          <button onClick={() => supabase.auth.signOut()}>Sign Out</button>
        </div>
      )}
    </div>
  );
}