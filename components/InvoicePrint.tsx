// Perfect Invoice Print Component for Ko Hnit Aung Pharmacy
import React from 'react';
import { useSettingsStore } from '../store';

export interface InvoiceItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  price: number;
  amount: number;
}

export interface InvoiceProps {
  invoiceNo: string;
  date: string;
  customerName: string;
  items: InvoiceItem[];
  totalAmount: number;
  discount: number;
  netAmount: number;
}

export const InvoicePrint: React.FC<InvoiceProps> = ({
  invoiceNo,
  date,
  customerName,
  items,
  totalAmount,
  discount,
  netAmount,
}) => {
  const { settings } = useSettingsStore();
  const shopName = settings.shopNameReceipt || settings.companyName || 'ကိုနှစ်အောင် ဆေးဆိုင်';
  const address = settings.address || '';
  const phone = settings.phone || '';
  const taxId = settings.taxId || '';

  return (
    <div className="invoice-print-container">
      <style>{`
        @media print {
          @page {
            size: A5;
            margin: 0.5cm;
          }
          @media (max-width: 100mm) {
            @page {
              size: 80mm auto;
              margin: 0;
            }
          }
          body {
            margin: 0;
            padding: 0;
          }
          .invoice-print-container {
            page-break-after: avoid;
            page-break-inside: avoid;
          }
          * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
        
        .invoice-print-container {
          width: 100%;
          max-width: 210mm; /* A5 width */
          margin: 0 auto;
          padding: 15px;
          font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
          font-size: 11px;
          line-height: 1.4;
          color: #000;
          background: #fff;
        }
        
        @media (max-width: 100mm) {
          .invoice-print-container {
            max-width: 80mm; /* Thermal printer width */
            padding: 10px;
            font-size: 10px;
          }
        }
        
        .invoice-header {
          text-align: center;
          border-bottom: 2px solid #000;
          padding-bottom: 12px;
          margin-bottom: 15px;
        }
        
        .invoice-header h1 {
          margin: 0;
          font-size: 18px;
          font-weight: bold;
          color: #000;
          letter-spacing: 0.5px;
        }
        
        .invoice-header .subtitle {
          margin: 4px 0;
          font-size: 9px;
          color: #333;
        }
        
        .invoice-header .contact {
          margin: 2px 0;
          font-size: 9px;
          color: #555;
        }
        
        .invoice-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 15px;
        }
        
        .info-section {
          border: 2px solid #000;
          padding: 10px;
          background: #f9f9f9;
        }
        
        .info-section h3 {
          margin: 0 0 6px 0;
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
          border-bottom: 1px solid #000;
          padding-bottom: 3px;
        }
        
        .info-section p {
          margin: 3px 0;
          font-size: 10px;
        }
        
        .info-label {
          font-weight: bold;
          display: inline-block;
          min-width: 60px;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 12px;
          border: 2px solid #000;
        }
        
        .items-table thead {
          background: #1B5E20;
          color: #fff;
        }
        
        .items-table th {
          padding: 8px 6px;
          text-align: left;
          font-size: 10px;
          font-weight: bold;
          border: 1px solid #000;
          border-bottom: 2px solid #000;
        }
        
        .items-table th:nth-child(2),
        .items-table th:nth-child(3),
        .items-table th:nth-child(4),
        .items-table th:nth-child(5) {
          text-align: center;
        }
        
        .items-table th:last-child {
          text-align: right;
        }
        
        .items-table td {
          padding: 6px 4px;
          font-size: 10px;
          border: 1px solid #000;
          border-top: none;
          color: #000;
        }
        
        .items-table td:nth-child(2),
        .items-table td:nth-child(3),
        .items-table td:nth-child(4),
        .items-table td:nth-child(5) {
          text-align: center;
        }
        
        .items-table td:last-child {
          text-align: right;
        }
        
        .items-table tbody tr:nth-child(even) {
          background: #f5f5f5;
        }
        
        .totals-section {
          margin-top: 10px;
          margin-bottom: 15px;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 8px;
          font-size: 11px;
          border-bottom: 1px solid #000;
        }
        
        .total-row:last-child {
          border-bottom: 2px solid #000;
          font-weight: bold;
          font-size: 12px;
          background: #f0f0f0;
          margin-top: 4px;
        }
        
        .total-label {
          font-weight: bold;
        }
        
        .signatures-section {
          margin-top: 20px;
          border-top: 1px solid #000;
          padding-top: 12px;
        }
        
        .signatures-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        
        .signature-box {
          text-align: center;
          border-top: 2px solid #000;
          padding-top: 40px;
          min-height: 70px;
          position: relative;
        }
        
        .signature-label {
          font-size: 10px;
          font-weight: bold;
          margin-top: 8px;
          color: #000;
          text-transform: uppercase;
        }
        
        .invoice-footer {
          margin-top: 15px;
          text-align: center;
          font-size: 9px;
          color: #666;
          border-top: 1px dashed #000;
          padding-top: 8px;
        }
      `}</style>

      {/* Header */}
      <div className="invoice-header">
        <h1>{shopName}</h1>
        {address && <div className="subtitle">{address}</div>}
        {phone && <div className="contact">Tel: {phone}</div>}
        {taxId && <div className="contact">Tax ID: {taxId}</div>}
      </div>

      {/* Invoice Info Grid */}
      <div className="invoice-info-grid">
        <div className="info-section">
          <h3>Customer Info</h3>
          <p><span className="info-label">Name:</span> {customerName}</p>
          <p><span className="info-label">Date:</span> {new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</p>
        </div>
        
        <div className="info-section">
          <h3>Invoice Details</h3>
          <p><span className="info-label">Invoice #:</span> {invoiceNo}</p>
          <p><span className="info-label">Time:</span> {new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>
      </div>

      {/* Items Table */}
      <table className="items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Unit</th>
            <th>Price</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.qty}</td>
              <td>{item.unit}</td>
              <td>{item.price.toLocaleString()}</td>
              <td>{item.amount.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals Section */}
      <div className="totals-section">
        <div className="total-row">
          <span className="total-label">Subtotal:</span>
          <span>{totalAmount.toLocaleString()} MMK</span>
        </div>
        {discount > 0 && (
          <div className="total-row">
            <span className="total-label">Discount:</span>
            <span>-{discount.toLocaleString()} MMK</span>
          </div>
        )}
        <div className="total-row">
          <span className="total-label">Net Amount:</span>
          <span>{netAmount.toLocaleString()} MMK</span>
        </div>
      </div>

      {/* Signatures Section */}
      <div className="signatures-section">
        <div className="signatures-grid">
          <div className="signature-box">
            <div className="signature-label">Received By</div>
          </div>
          <div className="signature-box">
            <div className="signature-label">Checked By</div>
          </div>
          <div className="signature-box">
            <div className="signature-label">Delivered By</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="invoice-footer">
        <p>{settings.receiptFooter || 'Thank you for your business!'}</p>
        <p>---</p>
      </div>
    </div>
  );
};

// Print Invoice Function
export const printInvoice = (invoice: InvoiceProps, settings?: any) => {
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
        receiptFooter: 'Thank you for your business!',
        address: '',
        phone: '',
        taxId: ''
      };
    }
  }

  const shopName = settings.shopNameReceipt || settings.companyName || 'ကိုနှစ်အောင် ဆေးဆိုင်';
  const address = settings.address || '';
  const phone = settings.phone || '';
  const taxId = settings.taxId || '';
  const footer = settings.receiptFooter || 'Thank you for your business!';

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice - ${invoice.invoiceNo}</title>
        <style>
          @media print {
            @page {
              size: A5;
              margin: 0.5cm;
            }
            @media (max-width: 100mm) {
              @page {
                size: 80mm auto;
                margin: 0;
              }
            }
            body {
              margin: 0;
              padding: 0;
            }
            * {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
          
          body {
            font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
            font-size: 11px;
            line-height: 1.4;
            color: #000;
            background: #fff;
            margin: 0;
            padding: 15px;
          }
          
          .invoice-header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 12px;
            margin-bottom: 15px;
          }
          
          .invoice-header h1 {
            margin: 0;
            font-size: 18px;
            font-weight: bold;
            color: #000;
            letter-spacing: 0.5px;
          }
          
          .invoice-header .subtitle {
            margin: 4px 0;
            font-size: 9px;
            color: #333;
          }
          
          .invoice-header .contact {
            margin: 2px 0;
            font-size: 9px;
            color: #555;
          }
          
          .invoice-info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
          }
          
          .info-section {
            border: 2px solid #000;
            padding: 10px;
            background: #f9f9f9;
          }
          
          .info-section h3 {
            margin: 0 0 6px 0;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            border-bottom: 1px solid #000;
            padding-bottom: 3px;
          }
          
          .info-section p {
            margin: 3px 0;
            font-size: 10px;
          }
          
          .info-label {
            font-weight: bold;
            display: inline-block;
            min-width: 60px;
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
            border: 2px solid #000;
          }
          
          .items-table thead {
            background: #1B5E20;
            color: #fff;
          }
          
          .items-table th {
            padding: 8px 6px;
            text-align: left;
            font-size: 10px;
            font-weight: bold;
            border: 1px solid #000;
            border-bottom: 2px solid #000;
          }
          
          .items-table th:nth-child(2),
          .items-table th:nth-child(3),
          .items-table th:nth-child(4),
          .items-table th:nth-child(5) {
            text-align: center;
          }
          
          .items-table th:last-child {
            text-align: right;
          }
          
          .items-table td {
            padding: 6px 4px;
            font-size: 10px;
            border: 1px solid #000;
            border-top: none;
            color: #000;
          }
          
          .items-table td:nth-child(2),
          .items-table td:nth-child(3),
          .items-table td:nth-child(4),
          .items-table td:nth-child(5) {
            text-align: center;
          }
          
          .items-table td:last-child {
            text-align: right;
          }
          
          .items-table tbody tr:nth-child(even) {
            background: #f5f5f5;
          }
          
          .totals-section {
            margin-top: 10px;
            margin-bottom: 15px;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 4px 8px;
            font-size: 11px;
            border-bottom: 1px solid #000;
          }
          
          .total-row:last-child {
            border-bottom: 2px solid #000;
            font-weight: bold;
            font-size: 12px;
            background: #f0f0f0;
            margin-top: 4px;
          }
          
          .total-label {
            font-weight: bold;
          }
          
          .signatures-section {
            margin-top: 20px;
            border-top: 2px solid #000;
            padding-top: 12px;
          }
          
          .signatures-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
          }
          
          .signature-box {
            text-align: center;
            border-top: 2px solid #000;
            padding-top: 40px;
            min-height: 70px;
            position: relative;
          }
          
          .signature-label {
            font-size: 10px;
            font-weight: bold;
            margin-top: 8px;
            color: #000;
            text-transform: uppercase;
          }
          
          .invoice-footer {
            margin-top: 15px;
            text-align: center;
            font-size: 9px;
            color: #666;
            border-top: 1px dashed #000;
            padding-top: 8px;
          }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <h1>${shopName}</h1>
          ${address ? `<div class="subtitle">${address}</div>` : ''}
          ${phone ? `<div class="contact">Tel: ${phone}</div>` : ''}
          ${taxId ? `<div class="contact">Tax ID: ${taxId}</div>` : ''}
        </div>

        <div class="invoice-info-grid">
          <div class="info-section">
            <h3>Customer Info</h3>
            <p><span class="info-label">Name:</span> ${invoice.customerName}</p>
            <p><span class="info-label">Date:</span> ${new Date(invoice.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
          </div>
          
          <div class="info-section">
            <h3>Invoice Details</h3>
            <p><span class="info-label">Invoice #:</span> ${invoice.invoiceNo}</p>
            <p><span class="info-label">Time:</span> ${new Date(invoice.date).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Unit</th>
              <th>Price</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.qty}</td>
                <td>${item.unit}</td>
                <td>${item.price.toLocaleString()}</td>
                <td>${item.amount.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals-section">
          <div class="total-row">
            <span class="total-label">Subtotal:</span>
            <span>${invoice.totalAmount.toLocaleString()} MMK</span>
          </div>
          ${invoice.discount > 0 ? `
            <div class="total-row">
              <span class="total-label">Discount:</span>
              <span>-${invoice.discount.toLocaleString()} MMK</span>
            </div>
          ` : ''}
          <div class="total-row">
            <span class="total-label">Net Amount:</span>
            <span>${invoice.netAmount.toLocaleString()} MMK</span>
          </div>
        </div>

        <div class="signatures-section">
          <div class="signatures-grid">
            <div class="signature-box">
              <div class="signature-label">Received By</div>
            </div>
            <div class="signature-box">
              <div class="signature-label">Checked By</div>
            </div>
            <div class="signature-box">
              <div class="signature-label">Delivered By</div>
            </div>
          </div>
        </div>

        <div class="invoice-footer">
          <p>${footer}</p>
          <p>---</p>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 250);
};
