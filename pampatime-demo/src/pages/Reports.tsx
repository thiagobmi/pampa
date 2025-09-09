// src/pages/Reports.tsx
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScheduleReportGenerator from '@/components/reports/ScheduleReportGenerator';

const Reports = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-8">
        <ScheduleReportGenerator />
      </main>
      <Footer />
    </div>
  );
};

export default Reports;