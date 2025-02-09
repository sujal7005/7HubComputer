// src/components/SignIn.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { FaTwitter } from 'react-icons/fa';
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
      setUserId(parsedUser._id); // Assuming user object has an 'id' field
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
        // Update the API URL to the correct port
        console.log({ name, email, password, phoneNumber });
        const response = await axios.post('http://localhost:4000/api/signup', { name, email, password, phoneNumber });
        if (response.data.success) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          setUserId(response.data.user._id);
          navigate('/profile');
        } else {
          setError(response.data.message || 'Sign up failed');
        }
      } else {
        const response = await axios.post('http://localhost:4000/api/signin', { email, password });
        if (response.data.success) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          setUserId(response.data.user._id);
          navigate('/profile');
        } else {
          setError(response.data.message || 'Login failed');
        }
      }
    } catch (error) {
      console.error("Sign up error: ", error.response?.data || error.message); // Log the error for debugging
      setError('An error occurred. Please try again.');
    }
  };

  // Google login success handler
  const handleGoogleLoginSuccess = async (response) => {
    const { credential } = response;
    console.log("Google response:", response);
    try {
      const res = await axios.post('http://localhost:4000/api/google-signin', { credential });
      console.log("Backend response:", res.data); 
      if (res.data.success) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUserId(res.data.user._id);
        navigate('/profile');
      } else {
        setError(res.data.message || 'Google Sign-In failed');
      }
    } catch (err) {
      setError('An error occurred during Google login');
      console.error('Error during Google login:', err);
    }
  };

  // Facebook login success handler
  const handleFacebookLoginSuccess = async (response) => {
    const { accessToken } = response;
    try {
      const res = await axios.post('http://localhost:4000/api/facebook-signin', { accessToken });
      if (res.data.success) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUserId(res.data.user._id);
        navigate('/profile');
      } else {
        setError(res.data.message || 'Facebook Sign-In failed');
      }
    } catch (err) {
      setError('An error occurred during Facebook login');
    }
  };

  // Twitter login success handler
  const handleTwitterLoginSuccess = async (response) => {
    const { oauth_token, oauth_token_secret } = response;
    try {
      const response = await axios.post('http://localhost:4000/api/twitter-signin', { oauth_token, oauth_token_secret });
      if (response.data.url) {
        window.location.href = response.data.url;
        navigate('/profile');
      } else {
        setError(res.data.message || 'Twitter Sign-In failed');
      }
    } catch (err) {
      setError('An error occurred during Twitter login');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-gray-800 text-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">
        {isForgotPassword ? 'Forgot Password' : isSignUp ? 'Sign Up' : 'Login'}
      </h2>
      {error && <p className="text-red-500 text-center">{error}</p>}
      {resetMessage && <p className="text-green-500 text-center">{resetMessage}</p>}

      {!isForgotPassword ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-gray-300 rounded focus:outline-none"
                required
              />
              <input
                type="text"
                placeholder="Phone Number (+91)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-gray-300 rounded focus:outline-none"
                required
                pattern="\+91[0-9]{10}" // Regex pattern for validation
                title="Phone number must start with +91 followed by 10 digits"
              />
            </>
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 text-gray-300 rounded focus:outline-none"
            required
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-gray-300 rounded focus:outline-none pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2 focus:outline-none"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12c1.13 2.57 4.16 6 9 6s7.87-3.43 9-6-4.16-6-9-6-7.87 3.43-9 6z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12c0 1.6-1.34 3-3 3s-3-1.4-3-3 1.34-3 3-3 3 1.4 3 3z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12c1.13-2.57 4.16-6 9-6s7.87 3.43 9 6-4.16 6-9 6-7.87-3.43-9-6z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12a3 3 0 00-3-3M12 12a3 3 0 003 3M12 12a3 3 0 003-3" />
                </svg>
              )}
            </button>
          </div>
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded">
            {isSignUp ? 'Sign Up' : 'Login'}
          </button>
            <div className="mt-6 text-center">
              <p className="text-gray-400">Or login with</p>

              {/* Google Login */}
              <GoogleLogin
                clientId="863030671533-jfc601o3jbou0dnsu9obvasrq2i7onlm.apps.googleusercontent.com"
                buttonText="Login with Google"
                onSuccess={handleGoogleLoginSuccess}
                onFailure={() => setError('Google Login Failed')}
                className="my-2"
              />

              {/* Facebook Login */}
              {/* <FacebookLogin
                appId="YOUR_FACEBOOK_APP_ID"
                autoLoad={false}
                fields="name,email,picture"
                callback={handleFacebookLoginSuccess}
                cssClass="my-2 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                icon="fa-facebook"
              /> */}

              {/* Twitter Login */}
              <button
                onClick={handleTwitterLoginSuccess}
                className="flex items-center justify-center w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded"
              >
                <FaTwitter className="mr-2" /> Login with Twitter
              </button>
            </div>
        </form>
        ) : (
          <form 
            onSubmit={step === 1 ? handleRequestOTP : step === 2 ? handleVerifyOTP : handleResetPassword}
            className="space-y-4 bg-gray-800 p-6 rounded shadow-lg"
          >
            {step === 1 && (
              <>
                <div className="mb-4">
                  <label className="text-gray-300">Select OTP Delivery Method:</label>
                  <div className="flex items-center space-x-4">
                    <label className="text-gray-300">
                      <input
                        type="radio"
                        name="otpMethod"
                        value="email"
                        checked={otpMethod === 'email'}
                        onChange={() => setOtpMethod('email')}
                        className="mr-2"
                      />
                      Email
                    </label>
                    <label className="text-gray-300">
                      <input
                        type="radio"
                        name="otpMethod"
                        value="phone"
                        checked={otpMethod === 'phone'}
                        onChange={() => setOtpMethod('phone')}
                        className="mr-2"
                      />
                      Phone
                    </label>
                  </div>
                </div>

                {otpMethod === 'email' && (
                  <input 
                    type="email"
                    placeholder="Enter Email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)} 
                    required
                    className="w-full px-4 py-2 bg-gray-700 text-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                )}
                {otpMethod === 'phone' && (
                  <input
                    type="text"
                    placeholder="Enter Phone Number (+91)"
                    value={resetPhone}
                    onChange={(e) => setResetPhone(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 text-gray-300 rounded focus:outline-none"
                  />
                )}
              </>
            )}
            {step === 2 && (
              <input 
                type="text" 
                placeholder="Enter OTP" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                required
                className="w-full px-4 py-2 bg-gray-700 text-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}
            {step === 3 && (
              <input 
                type="password" 
                placeholder="New Password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                required
                className="w-full px-4 py-2 bg-gray-700 text-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}
            <button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded transition duration-300"
            >
              {step === 1 ? 'Send OTP' : step === 2 ? 'Verify OTP' : 'Reset Password'}
            </button>
          </form>
        )}
        <p className="text-center mt-4">
          {!isForgotPassword ? (
            <>
              {isSignUp ? (
                <span>
                  Already have an account?{' '}
                  <button onClick={() => setIsSignUp(false)} className="text-indigo-400 hover:underline">
                    Sign in
                  </button>
                </span>
              ) : (
                <span>
                  Don't have an account?{' '}
                  <button onClick={() => setIsSignUp(true)} className="text-indigo-400 hover:underline">
                    Sign up
                  </button>
                </span>
              )}
              <br />
              <button onClick={() => setIsForgotPassword(true)} className="text-indigo-400 hover:underline mt-2">
                Forgot Password?
              </button>
            </>
          ) : (
          <button onClick={() => setIsForgotPassword(false)} className="text-indigo-400 hover:underline">
            Back to Login
          </button>
        )}
      </p>
       {/* Display user ID or guest message */}
        <p className="text-center mt-4">
          {userId ? `User ID: ${userId}` : 'You are currently signed in as a guest.'}
        </p>
    </div>
  );
};

export default SignIn;