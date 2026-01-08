-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AppSetting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "companyName" TEXT NOT NULL DEFAULT 'Ko Hnit Aung Pharmacy',
    "taxId" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "language" TEXT NOT NULL DEFAULT 'English',
    "shopNameReceipt" TEXT NOT NULL DEFAULT 'Ko Hnit Aung Pharmacy',
    "receiptFooter" TEXT NOT NULL DEFAULT 'Thank you for your purchase!',
    "paperSize" TEXT NOT NULL DEFAULT '80mm',
    "defaultPrinter" TEXT NOT NULL DEFAULT 'System Default',
    "autoPrint" BOOLEAN NOT NULL DEFAULT false,
    "showImages" BOOLEAN NOT NULL DEFAULT true,
    "lowStockLimit" INTEGER NOT NULL DEFAULT 10,
    "expiryWarningDays" INTEGER NOT NULL DEFAULT 90,
    "expiryCriticalDays" INTEGER NOT NULL DEFAULT 180,
    "enableEmailReports" BOOLEAN NOT NULL DEFAULT false,
    "enableCriticalAlerts" BOOLEAN NOT NULL DEFAULT true,
    "notificationEmail" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_AppSetting" ("address", "autoPrint", "companyName", "createdAt", "defaultPrinter", "email", "enableCriticalAlerts", "enableEmailReports", "expiryCriticalDays", "expiryWarningDays", "id", "language", "lowStockLimit", "notificationEmail", "paperSize", "phone", "receiptFooter", "shopNameReceipt", "showImages", "taxId", "updatedAt") SELECT "address", "autoPrint", "companyName", "createdAt", "defaultPrinter", "email", "enableCriticalAlerts", "enableEmailReports", "expiryCriticalDays", "expiryWarningDays", "id", "language", "lowStockLimit", "notificationEmail", "paperSize", "phone", "receiptFooter", "shopNameReceipt", "showImages", "taxId", "updatedAt" FROM "AppSetting";
DROP TABLE "AppSetting";
ALTER TABLE "new_AppSetting" RENAME TO "AppSetting";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
