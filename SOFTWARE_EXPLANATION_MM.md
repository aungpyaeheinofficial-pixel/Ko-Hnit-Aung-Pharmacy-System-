# Parami Pharmacy System - Software Functions Explanation (မြန်မာ)

## နိဒါန်း (Introduction)

Parami Pharmacy System သည် ဆေးဆိုင်များအတွက် အပြည့်အစုံ စီမံခန့်ခွဲမှု စနစ်တစ်ခု ဖြစ်ပါသည်။ ဤစနစ်သည် အဓိက module များစွာကို ပေါင်းစပ်၍ ဆေးဆိုင်တစ်ခု၏ လုပ်ငန်းများအားလုံးကို ကွန်ပျူတာဖြင့် စီမံခန့်ခွဲနိုင်အောင် ပြုလုပ်ထားပါသည်။

## စနစ်၏ အဓိက အစိတ်အပိုင်းများ (Main Components)

### 1. Frontend (Front-end Application)
- **Technology Stack**: React, TypeScript, Vite
- **UI Framework**: Tailwind CSS
- **State Management**: Zustand
- **Charts**: Recharts library

### 2. Backend (Back-end API Server)
- **Technology Stack**: Node.js, Express.js, TypeScript
- **Database**: MySQL (via Prisma ORM)
- **Authentication**: JWT (JSON Web Token)

---

## Module အသေးစိတ်ရှင်းလင်းချက်များ (Detailed Module Explanations)

### 1. Dashboard (မူလစာမျက်နှာ)
Dashboard သည် စနစ်၏ အဓိက စာမျက်နှာဖြစ်ပြီး လုပ်ငန်း၏ အခြေအနေကို အချက်အလက်များဖြင့်ြသပါသည်။

#### Functions:
- **Total Revenue (စုစုပေါင်း အရောင်းရငွေ)**: 
  - ရွေးချယ်ထားသော ကာလ (Today, Week, Month, Year) အတွင်း စုစုပေါင်း အရောင်းရငွေကို တွက်ချြသပါသည်
  - ယခင်ကာလနှင့် နှိုင်းယှဉ်၍ growth percentage ကို တွက်ချက်ပါသည်
  - POS အရောင်းများနှင့် Distribution order များမှ ရရှိသော ဝင်ငွေအားလုံးကို ပေါင်းထည့်ပါသည်

- **Low Stock Items (ကုန်ပစ္စည်း နည်းသော အရာများ)**:
  - Stock level သည် minimum stock level ထက် နည်းနေသော ကုန်ပစ္စည်းများ၏ အရေအတွက်ကိုြသပါသည်
  - ဤဒေတာကို Inventory module သို့ လင့်ခ် ချိတ်ထားပါသည်

- **Total Customers (စုစုပေါင်း ဖောက်သည်များ)**:
  - စာရင်းသွင်းထားသော ဖောက်သည်များ၏ အရေအတွက်ကိုြသပါသည်

- **Revenue Analytics Chart (အရောင်းရငွေ ခွဲခြမ်းစိတ်ဖြာမှု ဂရပ်)**:
  - Area chart အသုံးပြု၍ ကာလအလိုက် အရောင်းရငွေ အပြောင်းအလဲကို ပုံဖော်ပါသည်
  - Today filter: တစ်နေ့လျှင် အချိန် (hour) အလိုက်
  - Week/Month filter: ရက်စွဲ (date) အလိုက်
  - Year filter: လ (month) အလိုက်

- **Top Sales Categories (အရောင်းအကောင်းဆုံး အမျိုးအစားများ)**:
  - Bar chart အသုံးပြု၍ အရောင်းအများဆုံး category 5 ခုကိုြသပါသည်

- **Recent Transactions (လတ်တလော အရောင်းအဝယ်မှတ်တမ်းများ)**:
  - နောက်ဆုံး transaction 5 ခုကို စာရြသပါသည်

---

### 2. POS (Point of Sale - အရောင်းကောင်တာ)

POS module သည် ဆေးဆိုင်တွင် ဖောက်သည်များအား ဆေးဝါးများ ရောင်းချရန် အသုံးပြုသော အဓိက module ဖြစ်ပါသည်。

#### Functions:

- **Product Selection (ကုန်ပစ္စည်း ရွေးချယ်ခြင်း)**:
  - Product card များကို grid layout တွင်ြသပါသည်
  - Product image, name, SKU, category, price, stock level တို့ကိုြသပါသည်
  - Product card ကို click လုပ်ခြင်းဖြင့် cart သို့ အလိုအလျောက် ထည့်ပေးပါသည်
  - Search bar အသုံးပြု၍ product ကို ရှာဖွေနိုင်ပါသည်
  - Category filter အသုံးပြု၍ အမျိုးအစားအလိုက် စစ်ထုတ်နိုင်ပါသည်

- **Shopping Cart (ဈေးခြင်းတောင်း)**:
  - Cart ထဲတွင် ရွေးထားသော product များကိုြသပါသည်
  - Quantity ကို increase/decrease လုပ်နိုင်ပါသည်
  - Item ကို cart မှ ဖယ်ရှားနိုင်ပါသည်
  - Subtotal, total ကို အလိုအလျောက် တွက်ချက်ပါသည်

- **Barcode Scanner (ဘားကုဒ် ဖတ်ရှုစက်)**:
  - Camera scanner အသုံးပြု၍ barcode ဖတ်ရှုနိုင်ပါသည်
  - GS1 barcode standard ကို support လုပ်ပါသည်
  - Scanned product ကို cart သို့ အလိုအလျောက် ထည့်ပေးပါသည်

- **Customer Selection (ဖောက်သည် ရွေးချယ်ခြင်း)**:
  - Customer အသစ် ထည့်သွင်းနိုင်ပါသည်
  - ရှိပြီးသား customer ကို search လုပ်နိုင်ပါသည်
  - Customer ရွေးထားပါက loyalty points ကို တွက်ချက်နိုင်ပါသည်

- **Payment Processing (ငွေချေမှု)**:
  - Payment method ရွေးချယ်နိုင်ပါသည်:
    - Cash (သားသား)
    - Card (ကတ်တစ်ခု)
    - KBZ Pay (KBZ Pay)
    - Credit (အကြွေး)
  - Cash payment အတွက် received amount ထည့်သွင်းပါက change amount ကို အလိုအလျောက် တွက်ချက်ပါသည်
  - Checkout button ကို click လုပ်ပါက transaction ကို save လုပ်ပြီး receipt ထုတ်ပေးပါသည်

- **Batch Management (Batch စီမံခန့်ခွဲမှု)**:
  - Product တွင် batch များရှိပါက batch ရွေးချယ်နိုင်ပါသည်
  - Expiry date ကို check လုပ်ပါသည်
  - Expired batch များအတွက် manager approval လိုအပ်ပါသည်

---

### 3. Inventory Management (ကုန်ပစ္စည်း စာရင်း စီမံခန့်ခွဲမှု)

Inventory module သည် store ထဲတွင်ရှိသော ကုန်ပစ္စည်းများ၏ စာရင်းကို စီမံခန့်ခွဲရန် အသုံးပြုပါသည်।

#### Functions:

- **Product Listing (ကုန်ပစ္စည်းများ စာရင်း)**:
  - Product အားလုံးကို table/grid format တွင်ြသပါသည်
  - Product information: SKU, name (English/Myanmar), category, price, stock level, unit, image
  - Search, category filter, status filter (All, Low Stock, In Stock) တို့ကို support လုပ်ပါသည်

- **Add New Product (ကုန်ပစ္စည်း အသစ် ထည့်သွင်းခြင်း)**:
  - Product form:
    - SKU (Stock Keeping Unit)
    - GTIN (Global Trade Item Number) - barcode number
    - Name (English)
    - Name (Myanmar)
    - Generic Name
    - Category (Antibiotics, Analgesics, Vitamins, etc.)
    - Price
    - Unit (STRIP, BOTTLE, BOX, etc.)
    - Stock Level
    - Min Stock Level
    - Requires Prescription (Yes/No)
    - Location (shelf location)
    - Image upload

- **Edit Product (ကုန်ပစ္စည်း ပြင်ဆင်ခြင်း)**:
  - Product information ကို update လုပ်နိုင်ပါသည်
  - Price, stock level, description စသည်တို့ကို ပြင်ဆင်နိုင်ပါသည်

- **Delete Product (ကုန်ပစ္စည်း ဖျက်ခြင်း)**:
  - Product ကို system မှ ဖယ်ရှားနိုင်ပါသည်
  - Confirmation dialog ကိုြသပါသည်

- **Stock Adjustment (Stock ပြင်ဆင်ခြင်း)**:
  - Stock level ကို manually adjust လုပ်နိုင်ပါသည်
  - Batch number, expiry date, cost price ထည့်သွင်းနိုင်ပါသည်

---

### 4. Stock Entry (ကုန်ပစ္စည်း ထည့်သွင်းခြင်း)

Stock Entry module သည် ဆေးဝါးများကို store ထဲသို့ ထည့်သွင်းရန် အသုံးပြုပါသည်။

#### Functions:

- **Add Stock (Stock ထည့်သွင်းခြင်း)**:
  - Product ရွေးချယ်ခြင်း
  - Batch number ထည့်သွင်းခြင်း
  - Expiry date ထည့်သွင်းခြင်း
  - Quantity ထည့်သွင်းခြင်း
  - Cost price ထည့်သွင်းခြင်း
  - Location ထည့်သွင်းခြင်း
  - Stock level ကို automatically update လုပ်ပါသည်

- **Barcode Scanning (Barcode ဖတ်ရှုခြင်း)**:
  - Camera scanner အသုံးပြု၍ product barcode ဖတ်ရှုနိုင်ပါသည်
  - GS1 barcode data (GTIN, batch number, expiry date, serial number) ကို parse လုပ်ပါသည်
  - Product information ကို automatically fill လုပ်ပေးပါသည်

---

### 5. Expiry Management (သက်တမ်းကုန်ဆုံးမှု စီမံခန့်ခွဲမှု)

Expiry module သည် expiry date နီးကပ်လာသော သို့မဟုတ် သက်တမ်းကုန်ဆုံးသွားသော product များကို track လုပ်ရန် အသုံးပြုပါသည်။

#### Functions:

- **Expiry Tracking (Expiry ကို ခြေရာခံခြင်း)**:
  - Expiry date နီးကပ်လာသော product များကို list လုပ်ပါသည်
  - Expired product များကို highlight လုပ်ပါသည်
  - Warning days (default: 30 days) အတွင်း expiry date ရှိသော product များကို alert ပြပါသည်

- **Batch Management (Batch စီမံခန့်ခွဲမှု)**:
  - Batch number အလိုက် expiry date ကို track လုပ်ပါသည်
  - FEFO (First Expired First Out) principle ကို follow လုပ်ပါသည်

---

### 6. Distribution (ဖြန့်ဖြူးရေး)

Distribution module သည် ဖောက်သည်များထံသို့ ဆေးဝါးများ delivery လုပ်ရန် အသုံးပြုပါသည်။

#### Functions:

- **Create Distribution Order (Distribution Order အသစ် ဖန်တီးခြင်း)**:
  - Customer name, address ထည့်သွင်းခြင်း
  - Product items ထည့်သွင်းခြင်း (quantity, price)
  - Delivery time ရွေးချယ်ခြင်း
  - Payment method ရွေးချယ်ခြင်း (Cash, Credit)
  - Total amount ကို automatically calculate လုပ်ပါသည်

- **Order Status Management (Order status စီမံခန့်ခွဲမှု)**:
  - PENDING (စောင့်ဆိုင်းနေသည်)
  - PACKING (ထုပ်ပိုးနေသည်)
  - DELIVERING (ပို့ဆောင်နေသည်)
  - COMPLETED (ပြီးစီးပြီ)

- **Update Order (Order ပြင်ဆင်ခြင်း)**:
  - Order information ကို update လုပ်နိုင်ပါသည်
  - Status ကို change လုပ်နိုင်ပါသည်

- **View Orders (Order များ ကြည့်ရှုခြင်း)**:
  - Distribution order အားလုံးကို list လုပ်ပါသည်
  - Filter by status, date range

---

### 7. Purchase (ဝယ်ယူမှု)

Purchase module သည် supplier များထံမှ ဆေးဝါးများ ဝယ်ယူရန် အသုံးပြုပါသည်။

#### Functions:

- **Create Purchase Order (Purchase Order အသစ် ဖန်တီးခြင်း)**:
  - Supplier ရွေးချယ်ခြင်း
  - Product items ထည့်သွင်းခြင်း
  - Unit cost, quantity ထည့်သွင်းခြင်း
  - Payment method (Cash, Credit)
  - Notes ထည့်သွင်းခြင်း
  - Total amount ကို automatically calculate လုပ်ပါသည်

- **Purchase Status (ဝယ်ယူမှု အခြေအနေ)**:
  - PENDING (စောင့်ဆိုင်းနေသည်)
  - ORDERED (မှာယူထားပြီ)
  - RECEIVED (လက်ခံရရှိပြီ)
  - CANCELLED (ပယ်ဖျက်ထားသည်)

- **Receive Order (Order လက်ခံခြင်း)**:
  - Order status ကို RECEIVED သို့ change လုပ်ပါက stock level ကို automatically update လုပ်ပါသည်

---

### 8. Finance (ဘဏ္ဍာရေး)

Finance module သည် ဆေးဆိုင်တစ်ခု၏ ဘဏ္ဍာရေး ကိစ္စများကို စီမံခန့်ခွဲရန် အသုံးပြုပါသည်။

#### Functions:

- **Transactions (ငွေလွှဲပြောင်းမှုများ)**:
  - Income (ဝင်ငွေ): Sales, other income sources
  - Expense (ထွက်ငွေ): Operating expenses, costs
  - Category, amount, date, description, payment method
  - Filter by date range, type, category

- **Expenses (အသုံးစရိတ်များ)**:
  - Expense entry: Category, amount, date, description
  - Status: PAID (ပေးချေပြီ), PENDING (ပေးချေရန် ကျန်ရှိ)
  - Track different expense categories

- **Payables (ပေးရမည့် ငွေများ)**:
  - Supplier များထံ ပေးရမည့် ငွေများ
  - Invoice number, amount, due date
  - Status: OVERDUE (နောက်ကျပြီ), DUE_SOON (မကြာမီ ပေးရမည်), NORMAL (ပုံမှန်)
  - Aging report

- **Receivables (ရရမည့် ငွေများ)**:
  - Customer များထံမှ ရရမည့် ငွေများ (credit sales)
  - Order reference, amount, due date
  - Status tracking
  - Collection management

- **Financial Reports (ဘဏ္ဍာရေး အစီရင်ခံစာများ)**:
  - Revenue reports
  - Expense reports
  - Profit/Loss statements
  - Cash flow reports

---

### 9. Customers (ဖောက်သည်များ)

Customer module သည် ဖောက်သည်များ၏ အချက်အလက်များကို စီမံခန့်ခွဲရန် အသုံးပြုပါသည်။

#### Functions:

- **Customer Registration (ဖောက်သည် စာရင်းသွင်းခြင်း)**:
  - Name, phone number (unique)
  - Points (loyalty points)
  - Tier (Silver, Gold, Platinum)

- **Customer Management (ဖောက်သည် စီမံခန့်ခွဲမှု)**:
  - Edit customer information
  - Update points
  - View purchase history
  - Delete customer

- **Loyalty Program (သစ္စာရှိမှု အစီအစဉ်)**:
  - Points system
  - Tier levels
  - Points redemption

---

### 10. Suppliers (ကုန်ပြည့်တင်ပို့သူများ)

Supplier module သည် supplier များ၏ အချက်အလက်များကို စီမံခန့်ခွဲရန် အသုံးပြုပါသည်।

#### Functions:

- **Supplier Registration (Supplier စာရင်းသွင်းခြင်း)**:
  - Name, contact, email
  - Credit limit (အကြွေး limit)
  - Outstanding amount (လက်ရှိ ပေးရမည့် ငွေ)

- **Supplier Management (Supplier စီမံခန့်ခွဲမှု)**:
  - Edit supplier information
  - Update credit limit
  - Track outstanding amounts
  - View purchase history

---

### 11. Scanner (Barcode Scanner)

Scanner module သည် barcode scanner device သို့မဟုတ် camera အသုံးပြု၍ product barcode များကို ဖတ်ရှုရန် အသုံးပြုပါသည်။

#### Functions:

- **GS1 Barcode Parsing (GS1 Barcode ဖတ်ရှုခြင်း)**:
  - GTIN (Global Trade Item Number)
  - Batch number
  - Expiry date
  - Serial number
  - Quantity

- **Scan History (ဖတ်ရှုမှု မှတ်တမ်း)**:
  - Scanned items အားလုံး၏ history
  - Sync status (PENDING, SYNCED, ERROR)
  - Verification status

- **Sync to Inventory (Inventory သို့ ထည့်သွင်းခြင်း)**:
  - Scanned data ကို verify လုပ်ပြီး inventory သို့ sync လုပ်ပါသည်
  - Stock level ကို automatically update လုပ်ပါသည်

---

### 12. Settings (ဆက်တင်များ)

Settings module သည် system ၏ အထွေထွေ ဆက်တင်များကို configure လုပ်ရန် အသုံးပြုပါသည်။

#### Settings Options:

- **Company Information (ကုမ္ပဏီ အချက်အလက်)**:
  - Company name
  - Tax ID
  - Phone, email, address

- **Receipt Settings (Receipt ဆက်တင်များ)**:
  - Shop name on receipt
  - Receipt footer message
  - Paper size (80mm, A4, etc.)
  - Default printer
  - Auto print enabled/disabled
  - Show images on receipt

- **Stock Settings (Stock ဆက်တင်များ)**:
  - Low stock limit (default: 10)
  - Expiry warning days (default: 30)

- **Notifications (အကြောင်းကြားချက်များ)**:
  - Enable email reports
  - Enable critical alerts
  - Notification email address

- **Language (ဘာသာစကား)**:
  - English/Myanmar

---

### 13. Branch Management (ဆိုင်ခွဲများ စီမံခန့်ခွဲမှု)

System သည် multi-branch support ကို provide လုပ်ပါသည်။

#### Functions:

- **Branch Selection (ဆိုင်ခွဲ ရွေးချယ်ခြင်း)**:
  - Multiple branches ကို manage လုပ်နိုင်ပါသည်
  - Current branch ကို switch လုပ်နိုင်ပါသည်
  - Branch-specific data ကို filter လုပ်ပါသည်

- **Branch Information (ဆိုင်ခွဲ အချက်အလက်)**:
  - Branch name, code, address
  - Phone, email
  - Manager name
  - Status (ACTIVE, INACTIVE, ARCHIVED)

---

### 14. Authentication & User Management (အသုံးပြုသူ စီမံခန့်ခွဲမှု)

#### User Roles (အသုံးပြုသူ အခန်းကဏ္ဍများ):

- **ADMIN (စီမံခန့်ခွဲသူ)**:
  - System အားလုံးကို access လုပ်နိုင်ပါသည်
  - Settings, users, branches ကို manage လုပ်နိုင်ပါသည်

- **MANAGER (မန်နေဂျာ)**:
  - Branch operations ကို manage လုပ်နိုင်ပါသည်
  - Reports ကို view လုပ်နိုင်ပါသည်
  - Approval permissions

- **PHARMACIST (ဆေးဝါးပညာရှင်)**:
  - Prescription verification
  - Product management
  - Stock management

- **CASHIER (ငွေကောင်တာ)**:
  - POS operations
  - Customer service
  - Basic transactions

#### Authentication:
- Login with email and password
- JWT token-based authentication
- Session management
- Logout functionality

---

## Database Schema (Database ဖွဲ့စည်းပုံ)

Database တွင် အဓိက table များမှာ:

1. **Branch**: ဆိုင်ခွဲများ
2. **User**: အသုံးပြုသူများ
3. **Product**: ကုန်ပစ္စည်းများ
4. **ProductBatch**: Batch များ
5. **Customer**: ဖောက်သည်များ
6. **Supplier**: Supplier များ
7. **PurchaseOrder**: ဝယ်ယူမှု order များ
8. **DistributionOrder**: Distribution order များ
9. **Sale**: အရောင်းများ
10. **Transaction**: ငွေလွှဲပြောင်းမှုများ
11. **Expense**: အသုံးစရိတ်များ
12. **Payable**: ပေးရမည့် ငွေများ
13. **Receivable**: ရရမည့် ငွေများ
14. **ScannerHistory**: Scanner မှတ်တမ်းများ
15. **AppSetting**: System ဆက်တင်များ

---

## System Workflow (စနစ် အလုပ်လုပ်ပုံ)

### 1. Sales Process (အရောင်းလုပ်ငန်း):

```
Customer arrives → Select products (manual/barcode scan) → 
Add to cart → Select customer (optional) → 
Choose payment method → Process payment → 
Generate receipt → Update stock → Record transaction
```

### 2. Stock Entry Process (Stock ထည့်သွင်းလုပ်ငန်း):

```
Purchase order created → Order received → 
Scan barcode or manually enter → Verify batch/expiry → 
Update inventory → Record purchase transaction
```

### 3. Distribution Process (ဖြန့်ဖြူးရေး လုပ်ငန်း):

```
Create distribution order → Add items → 
Set delivery time → Pack items → 
Update status to DELIVERING → 
Deliver to customer → 
Update status to COMPLETED → Process payment
```

---

## API Endpoints (API အဆုံးသတ်များ)

Backend API သည် RESTful architecture ကို follow လုပ်ပါသည်:

- `/api/auth/*`: Authentication
- `/api/products/*`: Product management
- `/api/inventory/*`: Inventory operations
- `/api/sales/*`: Sales operations
- `/api/customers/*`: Customer management
- `/api/distribution/*`: Distribution orders
- `/api/purchase/*`: Purchase orders
- `/api/finance/*`: Financial transactions
- `/api/suppliers/*`: Supplier management
- `/api/scanner/*`: Scanner operations
- `/api/settings/*`: System settings
- `/api/branches/*`: Branch management

---

## Security Features (လုံခြုံရေး အင်္ဂါရပ်များ)

1. **JWT Authentication**: Secure token-based authentication
2. **Password Hashing**: bcryptjs အသုံးပြု password hashing
3. **Role-based Access Control**: User roles အလိုက် permissions
4. **Input Validation**: Zod library အသုံးပြု data validation
5. **Error Handling**: Comprehensive error handling middleware

---

## Technology Highlights (နည်းပညာ အဓိက အချက်များ)

1. **Frontend**:
   - React 18 with TypeScript
   - Zustand for state management
   - Tailwind CSS for styling
   - Recharts for data visualization
   - React Router for navigation

2. **Backend**:
   - Node.js with Express.js
   - Prisma ORM for database operations
   - MySQL database
   - JWT for authentication
   - TypeScript for type safety

3. **Development Tools**:
   - Vite for fast development
   - ESLint for code quality
   - Prettier for code formatting

---

## Deployment (ဖြန့်ချိခြင်း)

Backend ကို Ubuntu VPS တွင် deploy လုပ်နိုင်ပါသည်:
- PM2 for process management
- Nginx as reverse proxy
- MySQL database
- Automated backups

Frontend ကို Vercel, Netlify စသည့် platform များတွင် deploy လုပ်နိုင်ပါသည်။

---

## Conclusion (နိဂုံး)

Parami Pharmacy System သည် ဆေးဆိုင်များအတွက် comprehensive solution တစ်ခု ဖြစ်ပါသည်။ POS, Inventory, Finance, Distribution အစရှိသော လုပ်ငန်းများအားလုံးကို တစ်ခုတည်းသော platform တွင် ပေါင်းစပ်၍ စီမံခန့်ခွဲနိုင်အောင် ပြုလုပ်ထားပါသည်။ System သည် scalable, secure, user-friendly ဖြစ်ပြီး Myanmar pharmacy businesses အတွက် သင့်လျော်သော features များကို provide လုပ်ပါသည်။
