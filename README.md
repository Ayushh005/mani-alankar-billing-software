# mani-alankar-billing-software

Mani Alankar Jewellers — Jewellery Billing & GST Invoice Management System

## Features
- **GST Jewellery Billing**: Auto-calculates Gold 24K, 22K (916), 18K (750), Silver, making charges, discounts, and SGST/CGST (3% GST).
- **Daily Metal Rates**: Fast manual daily store rate configuration with automatic 22K/18K calculation.
- **Customer Ledger & Partial Payments**: Track invoice history, receipts, pending dues, and customer payment logs.
- **Firebase Sync & Auth**: Cloud Firestore sync with Google Authentication whitelist protection.
- **Thermal & A4 Print**: Professional GST invoice printing supporting Rule-46 compliance with Hallmark details.

## Environment Setup
Copy `.env.example` to `.env` and fill in your Firebase project credentials:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=mani-alankar-billing.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=mani-alankar-billing
VITE_FIREBASE_STORAGE_BUCKET=mani-alankar-billing.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=636601069877
VITE_FIREBASE_APP_ID=your_firebase_app_id_here
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
```

## Getting Started
```bash
npm install
npm run dev
```
