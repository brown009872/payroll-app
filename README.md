# Time Tracking & Payroll App

A production-ready, local-first web application for managing employees, daily attendance, and weekly payroll calculations. Built with React, TypeScript, Vite, and Tailwind CSS.

## Features

*   **Employee Management**: Add, edit, and manage employees (soft delete support).
*   **Daily Attendance**: Track Check-in/Check-out times, set hourly rates, bonuses, and penalties.
*   **Weekly Summary**: View aggregated hours and payroll amounts for any selected week.
*   **Data Persistence**: All data is stored locally in the browser (`localStorage`).
*   **Export**: Export attendance history to CSV.
*   **Data Reset**: Option to clear specific days or reset the entire database.

## Tech Stack

*   **Frontend**: React 18, TypeScript, Vite
*   **Styling**: Tailwind CSS, clsx, tailwind-merge, Lucide Icons
*   **State Management**: Zustand (with persistence middleware)
*   **Forms**: React Hook Form

## Getting Started

### Prerequisites

*   Node.js (v18+ recommended)
*   npm

### Installation

1.  Clone the repository or navigate to the project directory.
2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Downgrade Tailwind (if needed for v3 compatibility):

    ```bash
    npm install -D tailwindcss@3.4.17 postcss autoprefixer
    ```

### Running Locally

Start the development server:

```bash
npm run dev
```

Open your browser at `http://localhost:5173`.

### Building for Production

Create a production build:

```bash
npm run build
```

The output will be in the `dist` folder. You can preview it locally using:

```bash
npm run preview
```

## Usage Guide

1.  **Employees Tab**: Start by adding your employees. Set their full name and position.
2.  **Daily Attendance Tab**:
    *   Select a date.
    *   Enter In/Out times for active employees.
    *   Set the hourly rate (defaults are not stored per employee, input per day or update logic to default).
    *   Totals update automatically.
3.  **Weekly Summary Tab**: Navigate to viewing the weekly report. Use Prev/Next week buttons to navigate.
4.  **Export Tab**: Download your data as a CSV file or reset application data.

## Note on Data

This application does **not** use a backend server. All data is stored in your browser's LocalStorage. If you clear your browser cache, the data will be lost. Use the Export feature regularly to backup your data.
