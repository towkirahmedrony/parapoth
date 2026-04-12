import React, { memo } from 'react';
import { X } from 'lucide-react';
import notificationGif from '../../../assets/animations/notifications.gif';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div 
        className="rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200"
        style={{ backgroundColor: 'var(--dyn-card)' }}
      >
        <div 
          className="flex justify-between items-center p-4 border-b"
          style={{ borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}
        >
          <h3 
            className="font-semibold text-lg font-['Hind_Siliguri']"
            style={{ color: 'var(--dyn-text)' }}
          >
            পারমিশন প্রয়োজন
          </h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full transition-colors hover:opacity-80"
            style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 text-center space-y-4">
          <div className="w-40 h-40 mx-auto">
            <img 
              src={notificationGif} 
              alt="Enable Notifications" 
              className="w-full h-full object-contain"
            />
          </div>
          
          <p 
            className="font-['Hind_Siliguri'] leading-relaxed"
            style={{ color: 'color-mix(in srgb, var(--dyn-text) 80%, transparent)' }}
          >
            নোটিফিকেশন চালু করতে আপনার ব্রাউজারের উপরে অ্যাড্রেস বারের বাম পাশে থাকা <strong style={{ color: 'var(--dyn-text)' }}>লক (🔒) বা শিল্ড আইকনে</strong> ক্লিক করুন এবং <strong style={{ color: 'var(--dyn-text)' }}>Notifications</strong> অপশনটি <strong style={{ color: 'var(--dyn-text)' }}>Allow</strong> করে দিন।
          </p>
        </div>

        <div 
          className="p-4"
          style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 3%, transparent)' }}
        >
          <button 
            onClick={() => {
              onClose();
              window.location.reload(); 
            }}
            className="w-full py-3 rounded-xl font-medium font-['Hind_Siliguri'] hover:opacity-90 transition-all shadow-lg"
            style={{ 
              backgroundColor: 'var(--dyn-primary)', 
              color: '#ffffff',
              boxShadow: '0 10px 15px -3px color-mix(in srgb, var(--dyn-primary) 30%, transparent)'
            }}
          >
            ঠিক আছে, রিলোড দিন
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(NotificationModal);
