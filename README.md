# 📊 SheetFlow

## 🚀 Tagline

**Simple, Flexible, and Cloud-Powered Profit Tracking using Google Sheets**

---

## 📖 Overview

Profit Calculator is a lightweight, frontend-only web application that helps users track and calculate profits using **Google Sheets as the database**.

Instead of building and maintaining a backend, this app directly reads from and writes to a connected Google Sheet, making it:

* Easy to set up
* Cost-effective
* Fully customizable via spreadsheet structure

The app is designed with simplicity in mind while still offering flexibility through dynamic column configuration.

---

## ✨ Features

### 🔐 Authentication

* Google Sign-In (OAuth)
* Secure and simple login experience
* No manual account management required

---

### 📄 Sheet-Based Data Management

* Uses Google Sheets as the **single source of truth**
* Automatically reads and writes data to the sheet
* No backend or database required

---

### 📋 Dynamic Row Listing

* Displays rows from the connected Google Sheet
* Each row shows:

  * **Title**
  * **Description**
* Clean and minimal UI for quick overview

---

### 🔍 Row Detail View

* View complete details of a selected row
* Displays all column values dynamically
* Adapts automatically based on settings configuration

---

### ➕ Add / ✏️ Edit Entries

* Create new rows or update existing ones
* Form fields are generated dynamically from **Settings**
* Supports flexible data structures without code changes

---

### ⚙️ Settings Management

* Fully control your sheet structure from the UI
* Add, edit, or remove columns (headers)
* Define:

  * Column names
  * Field types (optional future enhancement)
  * Role of fields (e.g., title, description)

---

### 🧠 Smart Row Mapping

* Mark specific columns as:

  * **Title field**
  * **Description field**
* These fields are used in the List page for better readability

---

### 📁 Dynamic Sheet Handling

* Sheet name is configurable via Settings
* If the sheet exists:

  * Data is fetched and displayed
* If not:

  * App can prompt or handle creation logic (future scope)

---

## 📱 Pages

### 1. 🔐 Login / Sign Up

* Single button: **Login with Google**
* After successful login → Redirect to List Page

---

### 2. 📋 List Page

* Displays all rows from the selected Google Sheet
* Shows:

  * Title (based on configured column)
  * Description (based on configured column)
* Click on a row → Navigate to Detail Page

---

### 3. 🔍 Row Detail Page

* Displays complete row data
* Dynamically renders all fields
* Clean UI for viewing structured information

---

### 4. ➕ Add / ✏️ Edit Page

* Dynamic form generated from Settings
* Supports:

  * Adding new rows
  * Editing existing rows
* Fields correspond to Google Sheet columns

---

### 5. ⚙️ Settings Page

* Configure:

  * Sheet name
  * Column headers
* Add / Edit / Remove columns
* Define which column acts as:

  * Title
  * Description

---

## 🛠️ Tech Stack

### Frontend

* **React.js** – Component-based UI
* **Tailwind CSS** – Utility-first styling
* **shadcn/ui** – Modern UI components

---

### Data & Integration

* **Google Sheets API** – Data storage and operations
* **Google OAuth** – Authentication

---

## 🔄 Application Flow

1. User logs in via Google
2. App loads Settings:

   * Sheet name
   * Column configuration
3. App checks if the sheet exists:

   * ✅ Exists → Fetch rows
   * ❌ Not exists → Handle accordingly
4. Redirect to List Page
5. User can:

   * View rows
   * Open details
   * Add/Edit entries
   * Modify settings

---

## 🧮 Example Use Case

| Buy Price | Repair Cost | Sell Price | Profit |
| --------- | ----------- | ---------- | ------ |
| 100       | 20          | 200        | 80     |

* Profit is calculated as:
  **Profit = Sell Price - (Buy Price + Repair Cost)**

This structure can be customized entirely using the Settings page.

---

## 🎯 Key Advantages

* ✅ No backend required
* ✅ Uses familiar Google Sheets
* ✅ Fully dynamic structure
* ✅ Easy to maintain and extend
* ✅ Works as a lightweight internal tool

---

## 🔮 Future Enhancements

* Auto profit calculation fields
* Column type support (number, text, date)
* Filtering & sorting
* Offline support (PWA)
* Multi-sheet support

---

## 📦 Setup Instructions

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

---

## 🔐 Permissions Required

* Google Sheets access (read/write)
* Google profile (for authentication)

---

## 📄 License

MIT License
