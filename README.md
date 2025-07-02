# Premium Miniapp Monorepo

This repository contains three main projects:

- **admin-dashboard**: React-based admin dashboard for managing orders and users.
- **backend**: Node.js/Express backend API for order management and payment processing.
- **frontend-miniapp**: Svelte/Vite-based miniapp for end-users to place orders and make payments.

---

## Project Structure

```
.
├── admin-dashboard/      # React admin dashboard
├── backend/              # Node.js/Express backend API
├── frontend-miniapp/     # Svelte/Vite miniapp
└── README.md             # This file
```

---

## Setup Instructions

### 1. Clone the repository
```bash
git clone <repo-url>
cd premium-miniapp
```

### 2. Install dependencies for each project
```bash
cd admin-dashboard && npm install && cd ..
cd backend && npm install && cd ..
cd frontend-miniapp && npm install && cd ..
```

---

## Running the Projects

### Backend (API)
```bash
cd backend
npm start
```
- The backend will start on the configured port (default: 5000).

### Admin Dashboard (React)
```bash
cd admin-dashboard
npm start
```
- The dashboard will be available at [http://localhost:3000](http://localhost:3000)

### Frontend Miniapp (Svelte/Vite)
```bash
cd frontend-miniapp
npm run dev
```
- The miniapp will be available at [http://localhost:5173](http://localhost:5173)

---

## Environment Variables
Each project may require its own `.env` file. See the respective README or `.env.example` in each folder for details.

---

## License
Specify your license here.
