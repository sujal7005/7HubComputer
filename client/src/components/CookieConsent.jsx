import React from 'react';
import { Link } from 'react-router-dom';
import CookieConsent from 'react-cookie-consent';

const CookieBanner = () => (
  <CookieConsent
    location="bottom"
    buttonText="ACCEPT"
    style={{ 
      background: "#FFFFFF",
      borderTop: "4px solid #000000",
      color: "#000000",
      padding: "12px 24px",
      fontSize: "14px",
      boxShadow: "0 -4px 0px 0px rgba(0,0,0,1)"
    }}
    buttonStyle={{ 
      background: "#000000",
      color: "#FFFFFF",
      fontSize: "13px",
      fontWeight: "bold",
      padding: "8px 24px",
      borderRadius: "0",
      border: "2px solid #000000",
      cursor: "pointer",
      transition: "all 0.3s ease"
    }}
    buttonWrapperStyle={{ 
      margin: "8px 0"
    }}
    buttonClasses="hover:bg-gray-800 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
    expires={365}
  >
    <div className="flex items-center gap-3">
      <div>
        <span className="font-bold text-black">This website uses cookies </span>
        <span className="text-gray-600">to enhance your experience. </span>
        <span style={{ fontSize: "12px" }}>
          Learn more in our{' '}
          <Link 
            to="/privacy" 
            style={{ 
              color: "#000000", 
              fontWeight: "bold",
              textDecoration: "underline",
              textUnderlineOffset: "2px",
              borderBottom: "1px solid #000000"
            }}
            className="hover:text-gray-600"
          >
            Privacy Policy
          </Link>
        </span>
      </div>
    </div>
  </CookieConsent>
);

export default CookieBanner;