import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} PetCare Co. All rights reserved.</p>
      <div className="contact-info">
        <p>📞 +91 1234567890</p>
        <p>✉️ contact@pawsitive.com</p>
      </div>
    </footer>
  );
};

export default Footer;
