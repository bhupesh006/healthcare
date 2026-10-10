import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Stethoscope } from 'lucide-react';

const Login = () => {
  const [loginType, setLoginType] = useState('ADMIN'); // 'ADMIN' or 'STAFF'
  const [email, setEmail] = useState('manager@healthcare.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);

  // Automatically update demo credentials when switching tabs for convenience
  useEffect(() => {
    if (loginType === 'ADMIN') {
      setEmail('manager@healthcare.com');
    } else {
      setEmail('arun@hc.com');
    }
    setError('');
  }, [loginType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password, loginType);
    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
            <Stethoscope className="text-white h-10 w-10" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Health<span className="text-primary">+</span>
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Healthcare Shift & Compliance Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Toggle Slider */}
        <div className="bg-slate-200 p-1 rounded-xl mb-6 flex relative w-3/4 mx-auto cursor-pointer shadow-inner">
          <div 
            className={`absolute top-1 bottom-1 w-1/2 bg-white rounded-lg shadow transition-all duration-300 ease-in-out ${loginType === 'ADMIN' ? 'left-1' : 'left-[48.5%]'}`}
          ></div>
          <button 
            className={`flex-1 py-2 text-sm font-semibold z-10 transition-colors ${loginType === 'ADMIN' ? 'text-primary' : 'text-slate-500'}`}
            onClick={() => setLoginType('ADMIN')}
            type="button"
          >
            Management
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-semibold z-10 transition-colors ${loginType === 'STAFF' ? 'text-primary' : 'text-slate-500'}`}
            onClick={() => setLoginType('STAFF')}
            type="button"
          >
            Staff Portal
          </button>
        </div>

        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700">Email address</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a href="#" className="font-medium text-primary hover:text-primary-hover">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                Sign in as {loginType === 'ADMIN' ? 'Management' : 'Staff'}
              </button>
            </div>
            
            <div className="mt-6 text-center text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="font-bold">Demo Credentials ({loginType === 'ADMIN' ? 'Management' : 'Staff'}):</span><br/>
              {loginType === 'ADMIN' ? (
                <span>Email: manager@healthcare.com<br/>Password: password123</span>
              ) : (
                <span>Email: arun@hc.com<br/>Password: password123</span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
