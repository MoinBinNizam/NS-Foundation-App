This is a comprehensive development roadmap. Based on your specific tech stack (**Node.js, Express, Prisma/SQLite** for the backend and **Vite, React, Tailwind** for the frontend), here is a professional, scalable folder structure.

I have organized this to follow the **Service-Controller-Route** pattern for the backend and a **Feature-based** structure for the frontend to ensure the 9.99% exit logic and investment modules remain modular.

---

## 📂 NS Foundation Project Structure

```text
ns-foundation/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # (Step 4) DB Schema via Prisma
│   │   └── seed.ts              # (Step 10) DB Seeding (Admin/Settings)
│   ├── src/
│   │   ├── config/              # (Step 11 & 12) Env, CORS, DB connection
│   │   │   └── passport.js      # Auth strategy config
│   │   ├── controllers/         # (Step 7) Request/Response handling
│   │   │   ├── authController.js
│   │   │   ├── paymentController.js
│   │   │   └── investmentController.js
│   │   ├── services/            # (Step 8) Business Logic (9.99% calc, ROI)
│   │   │   ├── calculationService.js
│   │   │   └── paymentService.js
│   │   ├── routes/              # (Step 6) API Endpoint definitions
│   │   │   ├── index.js         # Main router
│   │   │   ├── authRoutes.js
│   │   │   └── memberRoutes.js
│   │   ├── middleware/          # (Step 9 & 13) Auth & Validation
│   │   │   ├── authMiddleware.js
│   │   │   └── validateBatch.js # Custom NS 12 batch check
│   │   ├── models/              # (Step 3) Prisma Client wrappers if needed
│   │   ├── utils/               # Helpers (Date formatting, PDF generators)
│   │   └── app.js               # (Step 2) Express App entry point
│   ├── .env                     # (Step 11) JWT_SECRET, PORT
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/                 # (Step 23) Axios/Fetch instances
│   │   │   └── axiosInstance.js
│   │   ├── assets/              # Images, Logos (NS Foundation logo)
│   │   ├── components/          # (Step 21) Reusable UI 
│   │   │   ├── common/          # Buttons, Inputs, Verified Badge
│   │   │   └── layout/          # Sidebar, Navbar, Footer
│   │   ├── pages/               # (Step 22) Full Views
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Payments.jsx
│   │   │   └── Investments.jsx
│   │   ├── hooks/               # (Step 20) Custom hooks (useAuth, useFetch)
│   │   ├── context/             # (Step 19) State management (AuthContext)
│   │   ├── routes/              # (Step 18 & 25) Protected & Public Routes
│   │   │   └── AppRouter.jsx
│   │   ├── utils/               # (Step 26) Debounce helpers, Constants
│   │   └── App.jsx              # (Step 17) Main App setup
│   ├── .env                     # (Step 27) VITE_API_URL
│   ├── tailwind.config.js       # (Step 16) Tailwind setup
│   └── vite.config.js           # (Step 16) Vite setup
│
└── README.md                    # (Step 1) Conceptual Plan & Documentation
```

---

### 🔑 Key Implementation Notes for your Steps:

1.  **Strict "NS 12" Check (Step 9 & 24):** Place this in `backend/middleware/validateBatch.js`. Before the registration controller executes, this middleware checks the request body. If the batch isn't "NS 12", it blocks the request.
2.  **Investment Logic (Step 8):** Keep the logic for ROI calculation and multi-accountant deductions in `backend/services/calculationService.js`. This keeps your controllers clean and testable.
3.  **The "Green Badge" (Step 21):** Create a component `frontend/src/components/common/VerifiedBadge.jsx`. It should conditionally render based on the `isVerified` boolean from your Auth context.
4.  **9.99% Exit Logic (Step 8 & 22):** When a member clicks "Leave Organization," the frontend calls a service that hits a specialized backend route. The logic in `calculationService.js` should handle the math to avoid floating-point errors.

**Would you like me to generate the `backend/src/app.js` entry point (Step 2) to get your server running with CORS and JSON processing configured?**
