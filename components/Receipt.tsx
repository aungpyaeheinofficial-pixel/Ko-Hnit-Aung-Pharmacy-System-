// Receipt Component for Printing
import React from 'react';
import { useSettingsStore } from '../store';

interface ReceiptProps {
  sale: {
    id: string;
    items: Array<{
      nameEn: string;
      quantity: number;
      unitPrice: number;
      unit?: string;
    }>;
    total: number;
    paymentMethod: string;
    date: string;
    customerName?: string;
  };
}

export const Receipt: React.FC<ReceiptProps> = ({ sale }) => {
  const { settings } = useSettingsStore();
  const shopName = settings.shopNameReceipt || settings.companyName || 'ကိုနှစ်အောင် ဆေးဆိုင်';
  const footer = settings.receiptFooter || 'Thank you for your purchase!';

  return (
    <div className="receipt-container" style={{ 
      width: settings.paperSize === '58mm' ? '58mm' : '80mm',
      maxWidth: settings.paperSize === '58mm' ? '58mm' : '80mm',
      margin: '0 auto',
      padding: '10px',
      fontFamily: 'monospace',
      fontSize: '12px',
      lineHeight: '1.4'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '10px', borderBottom: '1px dashed #000', paddingBottom: '10px' }}>
        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{shopName}</h2>
        {settings.address && (
          <p style={{ margin: '4px 0', fontSize: '10px' }}>{settings.address}</p>
        )}
        {settings.phone && (
          <p style={{ margin: '4px 0', fontSize: '10px' }}>Tel: {settings.phone}</p>
        )}
        {settings.taxId && (
          <p style={{ margin: '4px 0', fontSize: '10px' }}>Tax ID: {settings.taxId}</p>
        )}
      </div>

      {/* Sale Info */}
      <div style={{ marginBottom: '10px', fontSize: '10px' }}>
        <p style={{ margin: '2px 0' }}>Receipt #: {sale.id.substring(0, 8)}</p>
        <p style={{ margin: '2px 0' }}>Date: {new Date(sale.date).toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
        {sale.customerName && (
          <p style={{ margin: '2px 0' }}>Customer: {sale.customerName}</p>
        )}
        <p style={{ margin: '2px 0' }}>Payment: {sale.paymentMethod}</p>
      </div>

      {/* Items */}
      <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '10px 0', marginBottom: '10px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #000' }}>
              <th style={{ textAlign: 'left', padding: '4px 0', fontSize: '10px' }}>Item</th>
              <th style={{ textAlign: 'center', padding: '4px 0', fontSize: '10px' }}>Qty</th>
              <th style={{ textAlign: 'right', padding: '4px 0', fontSize: '10px' }}>Price</th>
              <th style={{ textAlign: 'right', padding: '4px 0', fontSize: '10px' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item, index) => (
              <tr key={index} style={{ borderBottom: '1px dotted #ccc' }}>
                <td style={{ padding: '4px 0', fontSize: '10px' }}>{item.nameEn}</td>
                <td style={{ textAlign: 'center', padding: '4px 0', fontSize: '10px' }}>
                  {item.quantity} {item.unit || ''}
                </td>
                <td style={{ textAlign: 'right', padding: '4px 0', fontSize: '10px' }}>
                  {item.unitPrice.toLocaleString()}
                </td>
                <td style={{ textAlign: 'right', padding: '4px 0', fontSize: '10px', fontWeight: 'bold' }}>
                  {(item.quantity * item.unitPrice).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total */}
      <div style={{ textAlign: 'right', marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
        <p style={{ margin: '4px 0' }}>Total: {sale.total.toLocaleString()} Ks</p>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '15px', paddingTop: '10px', borderTop: '1px dashed #000', fontSize: '10px' }}>
        <p style={{ margin: '4px 0' }}>{footer}</p>
        <p style={{ margin: '4px 0' }}>---</p>
        <p style={{ margin: '4px 0' }}>Thank you!</p>
      </div>
    </div>
  );
};

// Print Receipt Function
export const printReceipt = (sale: ReceiptProps['sale'], settings?: any) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  // Get settings from store if not provided
  if (!settings) {
    try {
      const { useSettingsStore } = require('../store');
      settings = useSettingsStore.getState().settings;
    } catch {
      settings = {
        shopNameReceipt: 'ကိုနှစ်အောင် ဆေးဆိုင်',
        companyName: 'ကိုနှစ်အောင် ဆေးဆိုင်',
        receiptFooter: 'Thank you for your purchase!',
        paperSize: '80mm'
      };
    }
  }
  const shopName = settings.shopNameReceipt || settings.companyName || 'ကိုနှစ်အောင် ဆေးဆိုင်';
  const footer = settings.receiptFooter || 'Thank you for your purchase!';

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt</title>
        <style>
          @media print {
            @page {
              size: ${settings.paperSize === '58mm' ? '58mm' : '80mm'} auto;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 10px;
            }
          }
          body {
            font-family: monospace;
            font-size: 12px;
            width: ${settings.paperSize === '58mm' ? '58mm' : '80mm'};
            max-width: ${settings.paperSize === '58mm' ? '58mm' : '80mm'};
            margin: 0 auto;
            padding: 10px;
            line-height: 1.4;
          }
          .header {
            text-align: center;
            margin-bottom: 10px;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
          }
          .header h2 {
            margin: 0;
            font-size: 16px;
            font-weight: bold;
          }
          .header p {
            margin: 4px 0;
            font-size: 10px;
          }
          .sale-info {
            margin-bottom: 10px;
            font-size: 10px;
          }
          .sale-info p {
            margin: 2px 0;
          }
          .items {
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            padding: 10px 0;
            margin-bottom: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          thead tr {
            border-bottom: 1px solid #000;
          }
          th, td {
            padding: 4px 0;
            font-size: 10px;
          }
          th {
            text-align: left;
          }
          th:nth-child(2), td:nth-child(2) {
            text-align: center;
          }
          th:nth-child(3), td:nth-child(3),
          th:nth-child(4), td:nth-child(4) {
            text-align: right;
          }
          tbody tr {
            border-bottom: 1px dotted #ccc;
          }
          .total {
            text-align: right;
            margin-bottom: 10px;
            font-size: 14px;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px dashed #000;
            font-size: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${shopName}</h2>
          ${settings.address ? `<p>${settings.address}</p>` : ''}
          ${settings.phone ? `<p>Tel: ${settings.phone}</p>` : ''}
          ${settings.taxId ? `<p>Tax ID: ${settings.taxId}</p>` : ''}
        </div>
        
        <div class="sale-info">
          <p>Receipt #: ${sale.id.substring(0, 8)}</p>
          <p>Date: ${new Date(sale.date).toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
          ${sale.customerName ? `<p>Customer: ${sale.customerName}</p>` : ''}
          <p>Payment: ${sale.paymentMethod}</p>
        </div>
        
        <div class="items">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${sale.items.map(item => `
                <tr>
                  <td>${item.nameEn}</td>
                  <td>${item.quantity} ${item.unit || ''}</td>
                  <td>${item.unitPrice.toLocaleString()}</td>
                  <td><strong>${(item.quantity * item.unitPrice).toLocaleString()}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="total">
          <p>Total: ${sale.total.toLocaleString()} Ks</p>
        </div>
        
        <div class="footer">
          <p>${footer}</p>
          <p>---</p>
          <p>Thank you!</p>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  
  // Wait for content to load, then print
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
    // Close window after printing (optional)
    // printWindow.close();
  }, 250);
};
