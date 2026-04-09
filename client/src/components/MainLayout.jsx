import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const MainLayout = ({ children }) => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content fade-up pt-24 pb-20" style={{ minHeight: 'calc(100vh - 12rem)' }}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
