import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WeeklyCalendar from '@/components/history/WeeklyCalendar';
import EditHistory from '@/components/history/EditHistory';
import HistoryToolbar from '@/components/history/HistoryToolbar';

const History = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex flex-1 min-h-0">
        <main className="flex flex-col flex-1 overflow-hidden"> 
           <HistoryToolbar/>
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 overflow-auto">
              <WeeklyCalendar />
            </div>
            <EditHistory />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default History;