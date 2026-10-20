// শুধু প্রডাকশন বিল্ডে vConsole চালু করে (ডেভে main.tsx-এর আগের ব্লকই কাজ করে)।
// বন্ধ করতে Vercel Environment Variables-এ VITE_ENABLE_VCONSOLE=false দিয়ে Redeploy করুন।
const enabled =
  !import.meta.env.DEV && import.meta.env.VITE_ENABLE_VCONSOLE !== 'false';

if (enabled) {
  import('vconsole')
    .then(({ default: VConsole }) => {
      new VConsole();
    })
    .catch(() => {
      /* vConsole লোড না হলে অ্যাপ চলবে */
    });
}

export {};
