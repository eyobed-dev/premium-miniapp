# SvelteKit Admin Dashboard

This is a SvelteKit + Vite rewrite of the original React-based admin dashboard.

## Features
- Admin login (token stored in localStorage)
- Orders table with status filter
- Mark orders as completed/failed
- Upload payment proof (demo: just file name)
- Logout

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the dev server:
   ```bash
   npm run dev
   ```

## Environment
- Backend API expected at `http://localhost:5000/api`
- Uses Bulma and Tailwind for styling

---

Original React code is replaced by SvelteKit in this folder.
