
import React, { useState, useEffect } from 'react';
import TransactionsPage from './TransactionsPage';
import { TransactionImportExport } from './TransactionImportExport';
import { getTransactions } from '@/utils/localStorage';

export default function EnhancedTransactionsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const handleImportComplete = () => {
    // Trigger refresh of transactions data
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="relative">
      <div className="absolute right-8 top-4 z-10">
        <TransactionImportExport onImportComplete={handleImportComplete} />
      </div>
      <TransactionsPage key={`transactions-${refreshTrigger}`} />
    </div>
  );
}
