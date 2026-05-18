import React, { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Save, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { UserProfileData } from '../types/profile';
import { EDUCATION_BOARDS, CLASS_LEVELS, ACADEMIC_GROUPS } from '../utils/profileConstants';
import apiClient from '../../../shared/lib/apiClient';
import { supabase } from '../../../shared/lib/supabase';
import { QUERY_KEYS } from '../../../shared/constants/storageKeys';

// Components
import FormInputGroup from '../components/FormInputGroup';
import FormSelectGroup from '../components/FormSelectGroup';
import ProfileAvatarEdit from '../components/ProfileAvatarEdit';

// --- Local Translation Helpers ---
const translateBoard = (board: string) => {
  const map: Record<string, string> = {
    'Dhaka': 'ঢাকা', 'Rajshahi': 'রাজশাহী', 'Cumilla': 'কুমিল্লা', 'Jashore': 'যশোর',
    'Chattogram': 'চট্টগ্রাম', 'Barishal': 'বরিশাল', 'Sylhet': 'সিলেট',
    'Dinajpur': 'দিনাজপুর', 'Mymensingh': 'ময়মনসিংহ'
  };
  return map[board] || board;
};

const translateGroup = (group: string) => {
  const map: Record<string, string> = { 'Science': 'বিজ্ঞান', 'Business': 'ব্যবসায় শিক্ষা', 'Humanities': 'মানবিক' };
  return map[group] || group;
};

const translateClass = (level: string) => level.replace('HSC', 'এইচএসসি');
// ----------------------------------

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Partial<UserProfileData>>({});

  // Fetch Latest Profile Data strictly from DB to pre-populate fields
  const { data: dbUser, isLoading: isFetchingDB } = useQuery({
    queryKey: ['CURRENT_USER_PROFILE_EDIT'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (error) throw error;
      return data as UserProfileData;
    },
    staleTime: 0, 
  });

  useEffect(() => {
    if (dbUser && !formData.id) {
      setFormData(dbUser);
    } else if (location.state?.user && !formData.id && !dbUser) {
      setFormData(location.state.user);
    }
  }, [dbUser, location.state, formData.id]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (updateProfileMutation.isError) updateProfileMutation.reset();
  }, []);

  const handleAddressChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      address: {
        ...(typeof prev.address === 'object' && prev.address !== null ? prev.address : {}),
        full_address: value
      }
    }));
    if (updateProfileMutation.isError) updateProfileMutation.reset();
  }, []);

  const handleAvatarUpdate = useCallback((newAvatarUrl: string) => {
    setFormData(prev => ({ ...prev, avatar_url: newAvatarUrl }));
    queryClient.invalidateQueries({ queryKey: Array.isArray(QUERY_KEYS.USER_PROFILE) ? QUERY_KEYS.USER_PROFILE : [QUERY_KEYS.USER_PROFILE] });
  }, [queryClient]);

  const updateProfileMutation = useMutation({
    mutationFn: async (updateData: Partial<UserProfileData>) => {
      try {
        const response = await apiClient.patch('/profiles/update', updateData);
        return response.data;
      } catch (error) {
        if (isAxiosError(error)) {
          throw new Error(error.response?.data?.message || "প্রোফাইল আপডেট করতে সমস্যা হয়েছে।");
        }
        throw new Error("অপ্রত্যাশিত একটি সমস্যা হয়েছে।");
      }
    },
    onSuccess: () => {
      const queryKey = Array.isArray(QUERY_KEYS.USER_PROFILE) ? QUERY_KEYS.USER_PROFILE : [QUERY_KEYS.USER_PROFILE];
      queryClient.invalidateQueries({ queryKey });
      navigate(-1);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatePayload = {
      username: formData.username,
      full_name: formData.full_name,
      bio: formData.bio,
      institution: formData.institution,
      class_level: formData.class_level,
      group: formData.group,
      education_board: formData.education_board,
      batch_year: formData.batch_year,
      study_goal: formData.study_goal,
      gender: formData.gender,
      date_of_birth: formData.date_of_birth,
      guardian_phone: formData.guardian_phone,
      address: formData.address,
    };
    updateProfileMutation.mutate(updatePayload);
  };

  const getAddressValue = (address: unknown): string => {
    if (typeof address === 'string') return address;
    if (typeof address === 'object' && address !== null && 'full_address' in address) {
      return String((address as Record<string, unknown>).full_address || '');
    }
    return '';
  };

  const isLoading = updateProfileMutation.isPending;
  const isPageLoading = isFetchingDB && !formData.id;
  const errorMsg = updateProfileMutation.error?.message;

  if (isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative w-full sm:max-w-md sm:mx-auto bg-app">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center px-4 py-4 backdrop-blur-md bg-surface/90 border-b border-border-color">
        <button 
          onClick={() => navigate(-1)} 
          disabled={isLoading}
          className="p-2 -ml-2 rounded-full hover:bg-surface-elevated text-text-primary disabled:opacity-50 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-bold ml-2 text-text-primary">প্রোফাইল সম্পাদনা</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 pb-28 space-y-6">
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-start gap-3 text-sm text-red-500 transition-all">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p className="font-medium">{errorMsg}</p>
          </div>
        )}

        {/* Avatar Upload Component */}
        <ProfileAvatarEdit 
          userId={formData.id} 
          currentAvatarUrl={formData.avatar_url} 
          onAvatarUpdate={handleAvatarUpdate} 
        />

        <section>
          <h3 className="text-xs font-bold mb-3 tracking-wider text-primary">ব্যক্তিগত তথ্য</h3>
          <div className="space-y-3">
            <FormInputGroup label="ইউজারনেম" name="username" value={formData.username || ''} onChange={handleChange} placeholder="যেমন: towkir_ahmed" disabled={isLoading} />
            <FormInputGroup label="সম্পূর্ণ নাম" name="full_name" value={formData.full_name || ''} onChange={handleChange} disabled={isLoading} />
            <FormInputGroup label="বায়ো" name="bio" value={formData.bio || ''} onChange={handleChange} disabled={isLoading} isTextArea={true} placeholder="আপনার সম্পর্কে কিছু লিখুন..." />
            <div className="grid grid-cols-2 gap-3">
              {/* Updated Gender Select Field */}
              <FormSelectGroup 
                label="লিঙ্গ" 
                name="gender" 
                value={formData.gender || ''} 
                onChange={handleChange} 
                options={[
                  { label: 'নির্বাচন করুন', value: '' },
                  { label: 'ছাত্র', value: 'Male' },
                  { label: 'ছাত্রী', value: 'Female' }
                ]} 
                disabled={isLoading} 
              />
              <FormInputGroup type="date" label="জন্ম তারিখ" name="date_of_birth" value={formData.date_of_birth || ''} onChange={handleChange} disabled={isLoading} />
            </div>
            <FormInputGroup label="অভিভাবকের নম্বর" name="guardian_phone" type="tel" value={formData.guardian_phone || ''} onChange={handleChange} placeholder="01XXXXXXXXX" disabled={isLoading} />
            <FormInputGroup label="ঠিকানা" name="address" value={getAddressValue(formData.address)} onChange={handleAddressChange} placeholder="আপনার সম্পূর্ণ ঠিকানা লিখুন" disabled={isLoading} />
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold mb-3 tracking-wider text-primary">একাডেমিক তথ্য</h3>
          <div className="space-y-3">
            <FormInputGroup label="প্রতিষ্ঠান" name="institution" value={formData.institution || ''} onChange={handleChange} disabled={isLoading} />
            <div className="grid grid-cols-2 gap-3">
              <FormSelectGroup label="শ্রেণী/ক্লাস" name="class_level" value={formData.class_level || ''} onChange={handleChange} 
                options={CLASS_LEVELS.map(c => ({ label: translateClass(c), value: c }))} disabled={isLoading} />
              <FormSelectGroup label="বিভাগ/গ্রুপ" name="group" value={formData.group || ''} onChange={handleChange} 
                options={ACADEMIC_GROUPS.map(g => ({ label: translateGroup(g), value: g }))} disabled={isLoading} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormSelectGroup label="শিক্ষা বোর্ড" name="education_board" value={formData.education_board || ''} onChange={handleChange} 
                options={EDUCATION_BOARDS.map(b => ({ label: translateBoard(b), value: b }))} disabled={isLoading} />
              <FormInputGroup label="ব্যাচ (বছর)" name="batch_year" value={formData.batch_year || ''} onChange={handleChange} placeholder="যেমন: ২০২৬" disabled={isLoading} />
            </div>
            <FormInputGroup label="শিক্ষার লক্ষ্য" name="study_goal" value={formData.study_goal || ''} onChange={handleChange} placeholder="যেমন: বুয়েট (BUET)" disabled={isLoading} />
          </div>
        </section>
      </form>

      {/* Footer Save Button */}
      <div className="fixed bottom-0 left-0 right-0 sm:max-w-md sm:mx-auto p-4 pb-6 z-20 backdrop-blur-md bg-surface/90 border-t border-border-color">
        <button 
          onClick={handleSubmit} 
          disabled={isLoading}
          className="w-full font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg bg-primary text-primary-foreground"
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          {isLoading ? 'সংরক্ষণ করা হচ্ছে...' : 'পরিবর্তনগুলো সেভ করুন'}
        </button>
      </div>
    </div>
  );
};

export default EditProfile;
