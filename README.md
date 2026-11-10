# 🚗 AutoShield PRO — Car Detailing Studio CRM & Billing System

A complete, modern, zero-subscription **CRM and GST Billing Software** engineered specifically for **Car Detailing Studios, PPF Application Centers, and Ceramic Coating Workshops**.

Built with **React 18**, **Tailwind CSS**, **Node.js/Express**, and **SQLite (WebAssembly)**.

---

## ⚡ Quick Start (One-Click Launch)

### Method 1: Double-Click `start.bat` (Recommended on Windows)
Simply double-click:
```text
C:\Users\Muthuraja Rajasekar\Documents\Projects\car-detailing-crm\start.bat
```
This starts the local server and automatically opens `http://localhost:5000` in your web browser.

---

### Method 2: Command Line (PowerShell / Terminal)

```powershell
cd "c:\Users\Muthuraja Rajasekar\Documents\Projects\car-detailing-crm"
npm start
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser.

#### Development Mode (with Live HMR):
```powershell
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)**.

---

## 🌟 Core Detailing Modules & Capabilities

### 1. 📋 Job Cards & Bay Pipeline Tracker
- **Stage Progression:** `Received (Washing & PDI)` $\rightarrow$ `In Progress (Polishing/Coating/PPF)` $\rightarrow$ `Quality Inspection (QC)` $\rightarrow$ `Ready for Delivery` $\rightarrow$ `Delivered`.
- **Technician & Bay Assignment:** Assign detailers, track estimated delivery dates, fuel levels, and current odometers.
- **1-Click Invoice Generation:** Convert active job cards into GST tax invoices directly.

### 2. 🛡️ Pre-Delivery Vehicle Inspection (PDI) Sheet
- **Panel-by-Panel Damage Logging:** Mark pre-existing scratches, stone chips, dents, and repainted panels (Front bumper, Hood, Roof, Doors, Alloys, etc.).
- **Vehicle Handover Verification:** Document customer valuables removed, paint condition (swirls, oxidation, matte finish), and fuel level.

### 3. 👥 Customer & Vehicle Garage CRM
- **Registration Plate Lookup:** Search vehicles instantly by plate number (e.g., `MH 02 AB 1234`), customer name, or phone number.
- **Client Garage:** A single customer can own multiple vehicles with distinct segments, colors, and paint finishes.
- **Full History:** Complete timeline of past detailing visits, invoices, and active warranties.

### 4. 🧾 GST Invoicing & Billing
- **SAC 9987 Compliance:** Automobile maintenance and detailing tax invoicing with configurable CGST (9%) + SGST (9%) or IGST (18%).
- **Advance & Balance Tracking:** Record customer advance deposits on job card creation and track balances due.
- **Multiple Payment Modes:** UPI (with QR code on invoice), Cash, Card, Net Banking.
- **Clean A4 Printable Layout:** Header with studio logo, customer info, vehicle plate box, SAC codes, tax breakdown, bank details, and signature area.
- **Quotation / Estimate Mode:** Generate estimates and convert to Tax Invoices with one click upon client approval.

### 5. 🏆 Ceramic & PPF Digital Warranty Certificates
- Generates official **Warranty Certificates** for 3-Year / 5-Year Ceramic & PPF packages.
- Outlines maintenance wash requirements to ensure warranty validity.
- Ready to print or share with the vehicle owner.

### 6. 🔔 6-Month Maintenance & Warranty Follow-ups
- Automatically schedules reminders (e.g. 6-Month Ceramic Inspection & Hydrophobic Top-up Wash).
- **1-Click WhatsApp Trigger:** Opens pre-filled WhatsApp message on `wa.me` to notify customers when their service is due.

### 7. 🏷️ Sized Pricing Service Catalog
- Preloaded with detailing packages:
  - Ceramic Coating 9H (3-Yr Warranty)
  - Graphene Matrix Coating 10H (5-Yr Warranty)
  - Full Body PPF (Self-Healing TPU, 5-Yr Warranty)
  - Front Track PPF Package
  - Interior Deep Spa & Leather Rejuvenation
  - 3-Stage Paint Correction & Swirl Removal
  - Full Glass Hydrophobic Shield
  - Underbody Anti-Rust Coating
  - Signature Snow Foam Wash & Wax
- Auto-adjusts rates based on car size: **Hatchback / Sedan / Full SUV / Luxury & Exotic**.

---

## 📁 Project Structure

```text
car-detailing-crm/
├── package.json
├── vite.config.js
├── tailwind.config.js
├── start.bat
├── scripts/
│   └── patch-rollup.js         # WASM runtime bridge
├── server/
│   ├── index.js                # Express REST API
│   ├── db.js                   # SQLite (sql.js) database & schema
│   ├── routes/
│   │   ├── dashboard.js        # KPI counters & bay overview
│   │   ├── customers.js        # Customer CRM
│   │   ├── vehicles.js         # Vehicle registry & plate search
│   │   ├── jobs.js             # Job Cards & PDI inspection
│   │   ├── services.js         # Sized detailing packages
│   │   ├── invoices.js         # Invoices, estimates & payments
│   │   ├── reminders.js        # Ceramic / PPF warranty follow-ups
│   │   └── settings.js         # Studio GSTIN & bank settlement
│   └── data/
│       └── detailing.db        # SQLite database
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── VehicleInspectionModal.jsx   # Pre-delivery inspection sheet
│   │   ├── InvoicePrintModal.jsx        # A4 printable GST tax invoice
│   │   ├── WarrantyCertificateModal.jsx # Ceramic/PPF warranty certificate
│   │   └── WhatsAppShareModal.jsx       # WhatsApp notification generator
│   └── pages/
│       ├── Dashboard.jsx
│       ├── JobCards.jsx
│       ├── JobCardDetail.jsx
│       ├── Customers.jsx
│       ├── CustomerDetail.jsx
│       ├── Billing.jsx
│       ├── InvoiceEditor.jsx
│       ├── ServiceCatalog.jsx
│       ├── Reminders.jsx
│       └── Settings.jsx
```
