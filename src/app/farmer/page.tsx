'use client';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { createProfile, profileExists } from '../../lib/profileUtils';
import { useRouter } from 'next/navigation';

export default function CreateFarmerProfile() {
  const [session, setSession] = useState<Session | null>(null);
  const [isProfileCreated, setIsProfileCreated] = useState(false);
  const [isFarmer, setIsFarmer] = useState(true);
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
  const router = useRouter();

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
        router.push('/farmer/dashboard');
      } catch (error) {
        console.error('Error creating profile:', error);
      }
    }
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[color:var(--color-background)] text-[color:var(--color-text)] font-body">
        <h1 className="text-4xl font-bold mb-8 text-center">Farmer Profile Creation</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google']}
        />
      </div>
    );
  }

  if (isProfileCreated) {
    router.push('/farmer/dashboard');
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[color:var(--color-background)] text-[color:var(--color-text)] font-body">
      <h1 className="text-4xl font-bold mb-8 text-center">Farmer Profile Creation</h1>
      <form onSubmit={handleCreateProfile} className="w-full max-w-lg">
        {/* Basic Info */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Basic Information</h2>
          <div className="mb-4">
            <label htmlFor="firstname" className="block mb-2 font-bold">
              First Name
            </label>
            <input
              type="text"
              id="firstname"
              name="firstname"
              value={formData.firstname}
              onChange={handleInputChange}
              className="inp"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="lastname" className="block mb-2 font-bold">
              Last Name
            </label>
            <input
              type="text"
              id="lastname"
              name="lastname"
              value={formData.lastname}
              onChange={handleInputChange}
              className="inp"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="nickname" className="block mb-2 font-bold">
              Nickname
            </label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              value={formData.nickname}
              onChange={handleInputChange}
              className="inp"
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
          <div className="mb-4">
            <label htmlFor="contact_phone" className="block mb-2 font-bold">
              Phone Number
            </label>
            <input
              type="tel"
              id="contact_phone"
              name="contact_phone"
              value={formData.contact_phone}
              onChange={handleInputChange}
              className="inp"
              required
            />
          </div>
        </div>

        {/* Address Info */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Address Information</h2>
          <div className="mb-4">
            <label htmlFor="address" className="block mb-2 font-bold">
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="inp"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="city" className="block mb-2 font-bold">
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="inp"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="state" className="block mb-2 font-bold">
              State
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              className="inp"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="zip" className="block mb-2 font-bold">
              ZIP Code
            </label>
            <input
              type="text"
              id="zip"
              name="zip"
              value={formData.zip}
              onChange={handleInputChange}
              className="inp"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="country" className="block mb-2 font-bold">
              Country
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="inp"
              required
            />
          </div>
        </div>

        {/* Additional Info */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Additional Information</h2>
          <div className="mb-4">
            <label htmlFor="profile_pic_url" className="block mb-2 font-bold">
              Profile Picture URL
            </label>
            <input
              type="url"
              id="profile_pic_url"
              name="profile_pic_url"
              value={formData.profile_pic_url}
              onChange={handleInputChange}
              className="inp"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="latitude" className="block mb-2 font-bold">
              Latitude
            </label>
            <input
              type="number"
              id="latitude"
              name="latitude"
              value={formData.latitude}
              onChange={handleInputChange}
              className="inp"
              step="any"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="longitude" className="block mb-2 font-bold">
              Longitude
            </label>
            <input
              type="number"
              id="longitude"
              name="longitude"
              value={formData.longitude}
              onChange={handleInputChange}
              className="inp"
              step="any"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full mt-4"
        >
          Create Profile
        </button>
      </form>
    </div>
  );
}