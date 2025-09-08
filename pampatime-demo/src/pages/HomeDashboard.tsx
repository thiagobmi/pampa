import React from 'react';
import Header from '../components/Header'; 
import Footer from '../components/Footer'; 
import CardsAdm from '../components/home-dashboard/CardsAdm';
const HomeDashboard = () => {
  return (
    <>
      <Header />
 
      <main className="min-h-screen px-8 py-6 bg-white-50">
        <CardsAdm />     
      </main>
      <Footer />
    </>
  );
};

export default HomeDashboard;
