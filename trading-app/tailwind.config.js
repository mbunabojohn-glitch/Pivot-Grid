/** @type {import('tailwindcss').Config} */ 
 export default { 
   content: [ 
     "./index.html", 
     "./src/**/*.{js,ts,jsx,tsx}", 
   ], 
   theme: { 
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn .6s ease-out both',
        'slide-up': 'slideUp .7s ease-out both',
        'scale-in': 'scaleIn .4s ease-out both',
        float: 'float 6s ease-in-out infinite',
      },
    }, 
   }, 
   plugins: [], 
 };
