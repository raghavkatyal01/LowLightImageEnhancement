import React from 'react';

function Footer() {
  return (
    <footer style={footerStyle}>
      <div style={footerContainerStyle}>
        <p>&copy; GeekPie. All rights reserved.</p>
        <nav>
          {/* <a href="/about" style={linkStyle}>About Us</a> */}
          {/* <a href="/contact" style={linkStyle}>Contact</a> */}
          {/* <a href="/privacy" style={linkStyle}>Privacy Policy</a> */}
        </nav>
      </div>
    </footer>
  );
}

const footerStyle = {
  backgroundColor: '#000000',
  color: '#fff',
  padding: '10px 0',
  textAlign: 'center',
  position: 'fixed',
  width: '100%',
  bottom: '0',
  zIndex:"5"
};

const footerContainerStyle = {
  maxWidth: '1000px',
  margin: 'auto',
  zIndex:"5",
  padding: '0 20px',
};

const linkStyle = {
  color: '#fff',
  margin: '0 10px',
  textDecoration: 'none',
};

export default Footer;
