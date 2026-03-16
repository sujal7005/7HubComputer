// src/components/SignIn.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import FacebookLogin from "@greatsumini/react-facebook-login";
import { FaFacebook, FaTwitter, FaEnvelope, FaLock, FaUser, FaPhone, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from 'react-router-dom';
import axios from 'axios';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetPhone, setResetPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const [otpMethod, setOtpMethod] = useState('email');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      setUserId(parsedUser._id);
    }
  }, []);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePhoneNumber = (number) => /^\+91[0-9]{10}$/.test(number);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    try {
      console.log("Requesting OTP for email:", resetEmail);
      const data = resetEmail ? { email: resetEmail } : { phone: resetPhone };
      const response = await axios.post('http://localhost:4000/api/forgot-password/request-otp', data);
      console.log("OTP Response:", response.data);
      if (response.data.success) {
        setStep(2);
        setResetMessage('OTP sent to your ' + (resetEmail ? 'email' : 'phone number') + '.');
      } else {
        setError(response.data.message || 'Failed to send OTP.');
      }
    } catch (error) {
      console.error("Error details:", error.response?.data || error.message);
      setError(error.response?.data?.message || 'An error occurred while requesting OTP.');
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      const data = resetEmail ? { email: resetEmail, otp } : { phone: resetPhone, otp };
      const response = await axios.post('http://localhost:4000/api/forgot-password/verify-otp', data);
      if (response.data.success) {
        setStep(3);
        setResetMessage('OTP verified. You can now reset your password.');
      } else {
        setError(response.data.message || 'Invalid OTP.');
      }
    } catch (error) {
      console.error(error);
      setError('An error occurred while verifying OTP.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const data = resetEmail
        ? { email: resetEmail, newPassword }
        : { phone: resetPhone, newPassword };

      const response = await axios.post('http://localhost:4000/api/forgot-password/reset-password', data);

      if (response.data.success) {
        setResetMessage('Password has been reset. Please login.');
        setIsForgotPassword(false);
        setStep(1);
      } else {
        setError(response.data.message || 'Failed to reset password.');
      }
    } catch (error) {
      console.error(error);
      setError('An error occurred while resetting the password.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSignUp) {
      if (!validateEmail(email)) {
        setError('Please enter a valid email address.');
        return;
      }
      if (!validatePhoneNumber(phoneNumber)) {
        setError('Please enter a valid phone number (e.g., +919876543210).');
        return;
      }
    }

    try {
      if (isSignUp) {
        console.log({ name, email, password, phoneNumber });
        const response = await axios.post('http://localhost:4000/api/signup', { name, email, password, phoneNumber });
        if (response.data.success) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          localStorage.setItem('token', response.data.token);
          setUserId(response.data.user._id);
          navigate('/profile');
        } else {
          setError(response.data.message || 'Sign up failed');
        }
      } else {
        const response = await axios.post('http://localhost:4000/api/signin', { email, password });
        if (response.data.success) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          localStorage.setItem('token', response.data.token);
          setUserId(response.data.user._id);
          navigate('/profile');
        } else {
          setError(response.data.message || 'Login failed');
        }
      }
    } catch (error) {
      console.error("Sign up error: ", error.response?.data || error.message);
      setError('An error occurred. Please try again.');
    }
  };

  // Google login success handler
  const handleGoogleLoginSuccess = async (response) => {
    console.log("Google response:", response);
    const { credential } = response;
    if (!credential) {
      console.error("No credential received!");
      return;
    }

    try {
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: "902643667030-1l6l00sgj4lp7k7voht4rep5rr7svdfu.apps.googleusercontent.com",
        scope: "profile email https://www.googleapis.com/auth/user.phonenumbers.read",
        callback: async (tokenResponse) => {
          console.log("Access Token:", tokenResponse.access_token);

          const res = await fetch("http://localhost:4000/api/google-signin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              idToken: credential,
              accessToken: tokenResponse.access_token,
            }),
          });

          const data = await res.json();
          console.log("Backend response:", data);
          if (data.success) {
            localStorage.setItem('user', JSON.stringify(data.user));
            // If your backend sends a token for Google sign-in, store it too
            if (data.token) {
              localStorage.setItem('token', data.token);
            }
            setUserId(data.user._id);
            navigate('/profile');
          } else {
            setError(data.message || 'Google Sign-In failed');
          }
        },
      });

      tokenClient.requestAccessToken();

    } catch (err) {
      setError(err.response?.data?.message || "An error occurred during Google login");
      console.error('Error during Google login:', err);
    }
  };

  // Facebook login success handler
  const handleFacebookLoginSuccess = async (response) => {
    console.log("Facebook login response:", response);

    if (!response || !response.accessToken) {
      console.error("No access token received");
      setError("Facebook login failed. Please try again.");
      return;
    }

    const { accessToken } = response;
    try {
      const res = await axios.post('http://localhost:4000/api/facebook-signin', { accessToken });

      if (res.data.success) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        // If your backend sends a token for Google sign-in, store it too
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
        }
        setUserId(res.data.user._id);
        navigate('/profile');
      } else {
        setError(res.data.message || 'Facebook Sign-In failed');
      }
    } catch (err) {
      setError('An error occurred during Facebook login');
      console.error('Error during FaceBook login:', err);
    }
  };

  // Update the Twitter login button in your SignIn.jsx
  const handleTwitterLogin = () => {
    // Store the current location to redirect back
    localStorage.setItem('redirectAfterLogin', window.location.pathname);
    
    // Use OAuth 2.0 endpoint
    window.location.href = "http://localhost:4000/auth/twitter";
  };

  return (
    <div className="bg-white pt-24 md:pt-28 pb-20 min-h-screen">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          
          {/* Page Header */}
          <div className="border-b-2 border-black pb-6 mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-2">
              {isForgotPassword ? 'Reset Password' : isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-gray-600">
              {isForgotPassword 
                ? 'Enter your details to reset your password' 
                : isSignUp 
                  ? 'Sign up to start shopping' 
                  : 'Sign in to continue'}
            </p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="border-2 border-red-500 bg-red-50 p-4 mb-6">
              <p className="text-red-600 text-center">{error}</p>
            </div>
          )}
          {resetMessage && (
            <div className="border-2 border-green-500 bg-green-50 p-4 mb-6">
              <p className="text-green-600 text-center">{resetMessage}</p>
            </div>
          )}

          {/* Main Form */}
          <div className="border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            
            {!isForgotPassword ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Sign Up Fields */}
                {isSignUp && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="+919876543210"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                          required
                          pattern="\+91[0-9]{10}"
                          title="Phone number must start with +91 followed by 10 digits"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  className="w-full bg-black text-white py-4 text-lg font-medium hover:bg-gray-800 transition-colors border-2 border-black mt-6"
                >
                  {isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
                </button>

                {/* Forgot Password Link */}
                {!isSignUp && (
                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-sm text-gray-600 hover:text-black border-b border-black pb-0.5"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
              </form>
            ) : (
              /* Forgot Password Form */
              <form
                onSubmit={step === 1 ? handleRequestOTP : step === 2 ? handleVerifyOTP : handleResetPassword}
                className="space-y-5"
              >
                {step === 1 && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-3">
                        OTP Delivery Method
                      </label>
                      <div className="flex items-center space-x-6">
                        <label className="flex items-center gap-2 text-black">
                          <input
                            type="radio"
                            name="otpMethod"
                            value="email"
                            checked={otpMethod === 'email'}
                            onChange={() => setOtpMethod('email')}
                            className="w-4 h-4"
                          />
                          <span>Email</span>
                        </label>
                        <label className="flex items-center gap-2 text-black">
                          <input
                            type="radio"
                            name="otpMethod"
                            value="phone"
                            checked={otpMethod === 'phone'}
                            onChange={() => setOtpMethod('phone')}
                            className="w-4 h-4"
                          />
                          <span>Phone</span>
                        </label>
                      </div>
                    </div>

                    {otpMethod === 'email' && (
                      <div>
                        <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          placeholder="you@example.com"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          required
                          className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                        />
                      </div>
                    )}
                    
                    {otpMethod === 'phone' && (
                      <div>
                        <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          placeholder="+919876543210"
                          value={resetPhone}
                          onChange={(e) => setResetPhone(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                        />
                      </div>
                    )}
                  </>
                )}
                
                {step === 2 && (
                  <div>
                    <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                    />
                  </div>
                )}
                
                {step === 3 && (
                  <div>
                    <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                    />
                  </div>
                )}
                
                <button
                  type="submit"
                  className="w-full bg-black text-white py-4 text-lg font-medium hover:bg-gray-800 transition-colors border-2 border-black mt-6"
                >
                  {step === 1 ? 'SEND OTP' : step === 2 ? 'VERIFY OTP' : 'RESET PASSWORD'}
                </button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(false)}
                    className="text-sm text-gray-600 hover:text-black border-b border-black pb-0.5"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            )}

            {/* Divider */}
            {!isForgotPassword && (
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">OR</span>
                </div>
              </div>
            )}

            {/* Social Login */}
            {!isForgotPassword && (
              <div className="space-y-3">
                <p className="text-sm text-center text-gray-600 mb-4">Continue with</p>
                
                {/* Google Login */}
                <GoogleOAuthProvider
                  clientId="902643667030-1l6l00sgj4lp7k7voht4rep5rr7svdfu.apps.googleusercontent.com"
                >
                  <div className="border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                    <GoogleLogin
                      onSuccess={handleGoogleLoginSuccess}
                      onError={() => console.log("Google Login Failed")}
                      theme="filled_black"
                      shape="rectangular"
                      size="large"
                      width="100%"
                      text="continue_with"
                    />
                  </div>
                </GoogleOAuthProvider>

                {/* Facebook Login */}
                <FacebookLogin
                  appId={import.meta.env.VITE_FACEBOOK_APP_ID}
                  onSuccess={handleFacebookLoginSuccess}
                  onFail={(error) => console.error("Facebook Login Failed:", error)}
                  fields="name,email,picture"
                  scope="public_profile,email"
                  redirectUri={window.location.origin}
                  render={({ onClick }) => (
                    <button
                      onClick={onClick}
                      className="w-full flex items-center border-2 border-black bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all px-4 py-3"
                    >
                      <FaFacebook className="text-blue-600 text-2xl mr-3" />
                      <span className="flex-1 text-center font-medium text-black">
                        Continue with Facebook
                      </span>
                    </button>
                  )}
                />

                {/* Twitter Login */}
                <button
                  onClick={handleTwitterLogin}
                  className="w-full flex items-center border-2 border-black bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all px-4 py-3"
                >
                  <FaTwitter className="text-blue-400 text-2xl mr-3" />
                  <span className="flex-1 text-center font-medium text-black">
                    Continue with Twitter
                  </span>
                </button>
              </div>
            )}

            {/* Toggle Sign Up/In */}
            {!isForgotPassword && (
              <div className="text-center mt-6 pt-6 border-t-2 border-gray-200">
                <p className="text-gray-600">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="font-bold text-black border-b-2 border-black hover:text-gray-600 hover:border-gray-600 transition-colors"
                  >
                    {isSignUp ? 'Sign In' : 'Create Account'}
                  </button>
                </p>
              </div>
            )}
          </div>

          {/* Guest Status */}
          <p className="text-center text-sm text-gray-500 mt-6">
            {userId ? `Logged in as user: ${userId}` : 'You are browsing as a guest.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;