import React from 'react';
import { Link } from 'react-router-dom';
import CookieConsent from 'react-cookie-consent';

const CookieBanner = () => (
  <CookieConsent
    location="bottom"
    buttonText="I Accept"
    style={{ background: "#2B373B" }}
    buttonStyle={{ color: "#4e503b", fontSize: "13px" }}
    expires={365}
  >
    This website uses cookies to enhance the user experience.{" "}
    <span style={{ fontSize: "10px" }}>
      Learn more in our <Link to="/privacy" style={{ color: "#FFD700", textDecoration: "underline", }}>Privacy Policy</Link>
      </span>
  </CookieConsent>
);

export default CookieBanner;