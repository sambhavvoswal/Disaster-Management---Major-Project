import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleAuth = () => setIsLogin(!isLogin);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-gray-900 p-6">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="backdrop-blur-xl bg-white/10 shadow-2xl border border-white/20 rounded-2xl overflow-hidden p-8">
          <div className="text-center text-white mb-6">
            <h2 className="text-3xl font-semibold tracking-wide">
              {isLogin ? 'Welcome Back!' : 'Create Account'}
            </h2>
            <p className="text-gray-300 text-sm mt-1">
              {isLogin
                ? 'Login to access your disaster management dashboard.'
                : 'Sign up to stay updated on disaster alerts.'}
            </p>
          </div>

          <form className="space-y-5">
            {!isLogin && (
              <div>
                <label className="text-gray-200 text-sm mb-1 block">Full Name</label>
                <input type="text" placeholder="John Doe" className="w-full p-2 rounded bg-white/10 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            )}

            <div>
              <label className="text-gray-200 text-sm mb-1 block">Email</label>
              <input type="email" placeholder="example@mail.com" className="w-full p-2 rounded bg-white/10 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="text-gray-200 text-sm mb-1 block">Password</label>
              <input type="password" placeholder="••••••••" className="w-full p-2 rounded bg-white/10 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {!isLogin && (
              <div>
                <label className="text-gray-200 text-sm mb-1 block">Confirm Password</label>
                <input type="password" placeholder="••••••••" className="w-full p-2 rounded bg-white/10 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            )}

            {isLogin && (
              <div className="flex justify-between items-center text-sm text-gray-300">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="accent-blue-600" />
                  <span>Remember Me</span>
                </label>
                <button type="button" className="text-blue-400 hover:underline">
                  Forgot Password?
                </button>
              </div>
            )}

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-2 text-lg font-semibold transition-all duration-300">
              {isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>

          <motion.div
            className="text-center text-gray-300 text-sm mt-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {isLogin ? (
              <>
                Don’t have an account?{' '}
                <button onClick={toggleAuth} className="text-yellow-400 hover:underline">
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button onClick={toggleAuth} className="text-yellow-400 hover:underline">
                  Login
                </button>
              </>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}


export default Login