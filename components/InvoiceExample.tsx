// Example usage of InvoicePrint component
import React from 'react';
import { InvoicePrint, printInvoice, InvoiceProps } from './InvoicePrint';

// Example: How to use InvoicePrint component
export const InvoiceExample = () => {
  // Sample invoice data
  const sampleInvoice: InvoiceProps = {
    invoiceNo: 'INV-2024-001',
    date: new Date().toISOString(),
    customerName: 'John Doe',
    items: [
      {
        id: '1',
        name: 'Paracetamol 500mg',
        qty: 2,
        unit: 'STRIP',
        price: 500,
        amount: 1000,
      },
      {
        id: '2',
        name: 'Amoxicillin 250mg',
        qty: 1,
        unit: 'BOX',
        price: 3000,
        amount: 3000,
      },
      {
        id: '3',
        name: 'Vitamin C 1000mg',
        qty: 3,
        unit: 'BOTTLE',
        price: 2000,
        amount: 6000,
      },
    ],
    totalAmount: 10000,
    discount: 500,
    netAmount: 9500,
  };

  const handlePrint = () => {
    printInvoice(sampleInvoice);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Invoice Print Example</h1>
      
      {/* Preview */}
      <div className="mb-6 border-2 border-gray-300 p-4 bg-white">
        <InvoicePrint {...sampleInvoice} />
      </div>

      {/* Print Button */}
      <button
        onClick={handlePrint}
        className="px-6 py-3 bg-[#1B5E20] text-white rounded-lg hover:bg-[#2E7D32] font-bold"
      >
        Print Invoice
      </button>
    </div>
  );
};
