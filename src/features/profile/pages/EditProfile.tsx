import React, { useState, useCallback } from 'react';
import { ArrowLeft, Save, Camera, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { UserProfileData } from '../types/profile';
import { PROFILE_DEFAULTS, EDUCATION_BOARDS, CLASS_LEVELS, ACADEMIC_GROUPS, GENDERS } from '../utils/profileConstants';
import apiClient from '@/shared/lib/apiClient';
import { QUERY_KEYS } from '@/shared/constants/storageKeys';

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
  const map: Record<string, string> = {
    'Science': 'বিজ্ঞান', 'Business': 'ব্যবসায় শিক্ষা', 'Humanities': 'মানবিক'
  };
  return map[group] || group;
};

const translateGender = (gender: string) => {
  const map: Record<string, string> = {
    'Male': 'পুরুষ', 'Female': 'মহিলা'
  };
  return map[gender] || gender;
};

const translateClass = (level: string) => {
  return level.replace('HSC', 'এইচএসসি');
};
// ----------------------------------

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const initialUser = location.state?.user as UserProfileData | undefined;
  const [formData, setFormData] = useState<UserProfileData>(initialUser || ({} as UserProfileData));

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (updateProfileMutation.isError) {
      updateProfileMutation.reset();
    }
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
    if (updateProfileMutation.isError) {
      updateProfileMutation.reset();
    }
  }, []);

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
    
    // নিখুঁত পেলোড (মোবাইল নাম্বার ছাড়া)
    const updatePayload = {
      full_name: formData.full_name,
      bio: formData.bio,
      institution: formData.institution,
      class_level: formData.class_level,
      group: formData.group,
      education_board: formData.education_board,
      batch_year: formData.batch_year,
      study_goal: formData.study_goal,
      gender: formData.gender,
      address: formData.address,
    };

    updateProfileMutation.mutate(updatePayload);
  };

  const getAddressValue = (address: UserProfileData['address']): string => {
    if (typeof address === 'string') return address;
    if (typeof address === 'object' && address !== null && 'full_address' in address) {
      return String(address.full_address || '');
    }
    return '';
  };

  const addressValue = getAddressValue(formData.address);
  const isLoading = updateProfileMutation.isPending;
  const errorMsg = updateProfileMutation.error?.message;

  return (
    <div 
      className="min-h-screen flex flex-col relative w-full sm:max-w-md sm:mx-auto"
      style={{ backgroundColor: 'var(--dyn-card)' }}
    >
      <div 
        className="sticky top-0 z-20 flex items-center px-4 py-4 backdrop-blur-md"
        style={{ 
          backgroundColor: 'color-mix(in srgb, var(--dyn-card) 90%, transparent)',
          borderBottom: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)' 
        }}
      >
        <button 
          onClick={() => navigate(-1)} 
          disabled={isLoading}
          className="p-2 -ml-2 rounded-full hover:[background-color:color-mix(in_srgb,var(--dyn-text)_5%,transparent)] disabled:opacity-50 transition-colors"
          style={{ color: 'var(--dyn-text)' }}
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-bold ml-2" style={{ color: 'var(--dyn-text)' }}>প্রোফাইল সম্পাদনা</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 pb-28 space-y-6">
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-start gap-3 text-sm text-red-500 transition-all">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p className="font-medium">{errorMsg}</p>
          </div>
        )}

        <div className="flex flex-col items-center mt-2">
          <div className="relative">
            <img 
              src={formData.avatar_url || PROFILE_DEFAULTS.AVATAR_URL} 
              className="w-28 h-28 rounded-full object-cover shadow-sm" 
              alt="Avatar" 
            />
            <button type="button" className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full text-white hover:bg-black/60 transition-colors backdrop-blur-[2px]">
              <Camera size={28} />
            </button>
          </div>
          <p className="text-xs mt-3 font-medium" style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}>ছবি পরিবর্তন করতে ট্যাপ করুন</p>
        </div>

        <section>
          <h3 className="text-xs font-bold mb-3 tracking-wider" style={{ color: 'var(--dyn-primary)' }}>একাডেমিক তথ্য</h3>
          <div className="space-y-3">
            <InputGroup label="প্রতিষ্ঠান" name="institution" value={formData.institution || ''} onChange={handleChange} disabled={isLoading} />
            <div className="grid grid-cols-2 gap-3">
              <SelectGroup 
                label="শ্রেণী/ক্লাস" 
                name="class_level" 
                value={formData.class_level || ''} 
                onChange={handleChange} 
                options={CLASS_LEVELS.map(c => ({ label: translateClass(c), value: c }))} 
                disabled={isLoading} 
              />
              <SelectGroup 
                label="বিভাগ/গ্রুপ" 
                name="group" 
                value={formData.group || ''} 
                onChange={handleChange} 
                options={ACADEMIC_GROUPS.map(g => ({ label: translateGroup(g), value: g }))} 
                disabled={isLoading} 
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SelectGroup 
                label="শিক্ষা বোর্ড" 
                name="education_board" 
                value={formData.education_board || ''} 
                onChange={handleChange} 
                options={EDUCATION_BOARDS.map(b => ({ label: translateBoard(b), value: b }))} 
                disabled={isLoading} 
              />
              <InputGroup label="ব্যাচ (বছর)" name="batch_year" value={formData.batch_year || ''} onChange={handleChange} placeholder="যেমন: ২০২৬" disabled={isLoading} />
            </div>
            <InputGroup label="শিক্ষার লক্ষ্য" name="study_goal" value={formData.study_goal || ''} onChange={handleChange} placeholder="যেমন: বুয়েট (BUET)" disabled={isLoading} />
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold mb-3 tracking-wider" style={{ color: 'var(--dyn-primary)' }}>ব্যক্তিগত তথ্য</h3>
          <div className="space-y-3">
            <InputGroup label="সম্পূর্ণ নাম" name="full_name" value={formData.full_name || ''} onChange={handleChange} disabled={isLoading} />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium" style={{ color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)' }}>বায়ো</label>
              <textarea 
                name="bio" 
                value={formData.bio || ''} 
                onChange={handleChange} 
                rows={3}
                disabled={isLoading}
                className="w-full rounded-xl p-3 text-sm focus:ring-2 focus:outline-none transition-all focus:ring-[var(--dyn-primary)] disabled:opacity-50"
                style={{ 
                  backgroundColor: 'color-mix(in srgb, var(--dyn-text) 3%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--dyn-text) 15%, transparent)',
                  color: 'var(--dyn-text)'
                }}
              />
            </div>
            <SelectGroup 
              label="লিঙ্গ" 
              name="gender" 
              value={formData.gender || ''} 
              onChange={handleChange} 
              options={GENDERS.map(g => ({ label: translateGender(g), value: g }))} 
              disabled={isLoading} 
            />
            <InputGroup label="ঠিকানা" name="address" value={addressValue} onChange={handleAddressChange} placeholder="আপনার সম্পূর্ণ ঠিকানা লিখুন" disabled={isLoading} />
          </div>
        </section>
      </form>

      <div 
        className="fixed bottom-0 left-0 right-0 sm:max-w-md sm:mx-auto p-4 pb-6 z-20 backdrop-blur-md"
        style={{ 
          backgroundColor: 'color-mix(in srgb, var(--dyn-card) 90%, transparent)',
          borderTop: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)'
        }}
      >
        <button 
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 hover:[background-color:color-mix(in_srgb,var(--dyn-primary)_80%,#000)] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
          style={{ 
            backgroundColor: 'var(--dyn-primary)', 
            color: 'var(--dyn-card)' 
          }}
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          {isLoading ? 'সংরক্ষণ করা হচ্ছে...' : 'পরিবর্তনগুলো সেভ করুন'}
        </button>
      </div>
    </div>
  );
};

interface InputGroupProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

const InputGroup: React.FC<InputGroupProps> = React.memo(({ label, name, value, onChange, placeholder, disabled, icon }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-medium" style={{ color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)' }}>{label}</label>
    <div className="relative">
       <input 
        type="text" 
        name={name} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-xl p-3.5 text-sm focus:ring-2 focus:outline-none disabled:opacity-50 transition-all focus:ring-[var(--dyn-primary)]"
        style={{ 
          backgroundColor: 'color-mix(in srgb, var(--dyn-text) 3%, transparent)',
          border: '1px solid color-mix(in srgb, var(--dyn-text) 15%, transparent)',
          color: 'var(--dyn-text)'
        }}
      />
      {icon && <span className="absolute right-4 top-3.5 text-lg">{icon}</span>}
    </div>
  </div>
));
InputGroup.displayName = 'InputGroup';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectGroupProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  disabled?: boolean;
}

const SelectGroup: React.FC<SelectGroupProps> = React.memo(({ label, name, value, onChange, options, disabled }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-medium" style={{ color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)' }}>{label}</label>
    <select 
      name={name} 
      value={value} 
      onChange={onChange}
      disabled={disabled}
      className="w-full rounded-xl p-3.5 text-sm focus:ring-2 focus:outline-none transition-all focus:ring-[var(--dyn-primary)] disabled:opacity-50 appearance-none"
      style={{ 
        backgroundColor: 'color-mix(in srgb, var(--dyn-text) 3%, transparent)',
        border: '1px solid color-mix(in srgb, var(--dyn-text) 15%, transparent)',
        color: 'var(--dyn-text)'
      }}
    >
      <option value="" style={{ color: '#000' }}>নির্বাচন করুন</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} style={{ color: '#000' }}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
));
SelectGroup.displayName = 'SelectGroup';

export default EditProfile;
