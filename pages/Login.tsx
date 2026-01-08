
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useBranchStore } from '../store';

const Login = () => {
  const [email, setEmail] = useState('admin@kohnitaung.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(async () => {
      try {
        await login(email, password);
        
        // Auto-select branch if user is restricted
        const user = useAuthStore.getState().user;
        if (user?.branchId) {
            useBranchStore.getState().setBranch(user.branchId);
        }
        
        navigate('/');
      } catch (e: any) {
        const errorMsg = e?.message || String(e);
        alert(`Login failed: ${errorMsg}`);
      } finally {
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-[#F1F8F4]">
      {/* Dark Green Top Half */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-[#1B5E20]"></div>
      
      {/* Light Green Bottom Half */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[#F1F8F4]"></div>

      <style>{`
        /* Button glow effect - Yellow */
        .sign-in-btn {
          background-color: #FFEB3B;
          color: #1B5E20;
          box-shadow: 0 4px 20px rgba(255, 235, 59, 0.3);
        }

        .sign-in-btn:hover {
          background-color: #F57F17;
          color: white;
          box-shadow: 0 10px 30px rgba(245, 127, 23, 0.4);
          transform: translateY(-2px);
        }

        .sign-in-btn:disabled {
          background-color: #E0E0E0;
          color: #9E9E9E;
        }

        /* Input focus glow - Green */
        .login-input:focus {
          border-color: #2E7D32;
          box-shadow: 0 0 0 4px rgba(46, 125, 50, 0.1);
        }

        /* Checkbox custom color - Green */
        .custom-checkbox {
          accent-color: #2E7D32;
        }
        .custom-checkbox:checked {
          background-color: #2E7D32;
          border-color: #2E7D32;
        }

        /* Smooth animations */
        * {
          transition: all 200ms ease;
        }
      `}</style>
      
      {/* Card Container */}
      <div className="bg-white w-full max-w-[420px] rounded-[32px] shadow-2xl z-10 overflow-hidden relative animate-in fade-in zoom-in-95 duration-300 p-12 border border-gray-100">
        
        {/* Header / Logo */}
        <div className="flex flex-col items-center justify-center mb-10 text-center">
           <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl mb-6 mx-auto transform hover:scale-105 transition-transform duration-300 overflow-hidden bg-white">
             <img 
               src="/assets/logo.jpg" 
               alt="Ko Hnit Aung Pharmacy Logo" 
               className="w-full h-full object-cover"
             />
           </div>
           <h1 className="text-[32px] font-bold text-[#1B5E20] font-mm leading-tight tracking-tight mb-1">ကိုနှစ်အောင် ဆေးဆိုင်</h1>
           <p className="text-[#2E7D32] font-medium text-base tracking-wide">Ko Hnit Aung Pharmacy</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="space-y-5">
               <div>
                   <label className="block text-sm font-medium text-[#1B5E20] mb-2 ml-1">Email Address</label>
                   <input 
                     type="email" 
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     placeholder="admin@kohnitaung.com" 
                     className="w-full h-[52px] px-4 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none transition-all font-medium text-base login-input"
                     required
                   />
               </div>
               <div>
                   <label className="block text-sm font-medium text-[#1B5E20] mb-2 ml-1">Password</label>
                   <input 
                     type="password" 
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     placeholder="••••••••" 
                     className="w-full h-[52px] px-4 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none transition-all font-medium text-base login-input"
                     required
                   />
               </div>
           </div>
           
           <div className="flex items-center justify-between pt-1">
             <label className="flex items-center gap-2 cursor-pointer select-none group">
               <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300 text-[#2E7D32] focus:ring-[#2E7D32] custom-checkbox transition-all cursor-pointer group-hover:border-[#2E7D32]" 
               />
               <span className="text-sm text-gray-700 font-medium group-hover:text-[#1B5E20] transition-colors">Remember me</span>
             </label>
             <a href="#" className="text-sm font-medium text-[#2E7D32] hover:text-[#1B5E20] hover:underline transition-colors">Forgot password?</a>
           </div>

           <button 
             type="submit" 
             className="w-full h-[52px] sign-in-btn font-semibold rounded-xl active:scale-98 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed text-base tracking-wide flex items-center justify-center transform hover:-translate-y-0.5"
             disabled={loading}
           >
             {loading ? (
                <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                </span>
             ) : 'Sign In'}
           </button>
        </form>

        <div className="mt-12 text-center space-y-1.5 border-t border-gray-100 pt-6">
           <p className="text-xs text-gray-400 font-medium">
              <span className="text-[#1B5E20] font-bold">Ko Hnit Aung Pharmacy</span> - Lite Version
           </p>
           <p className="text-[10px] text-gray-400">© 2024 Ko Hnit Aung Pharmacy. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
