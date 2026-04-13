# ShowMate — Smart Movie Booking Platform

<div align="center">



[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-purple?style=for-the-badge&logo=vercel)](https://showmate-sable.vercel.app)
[![Backend](https://img.shields.io/badge/Backend%20API-Render-blue?style=for-the-badge&logo=render)](https://showmate.onrender.com/api/health)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/YOUR_USERNAME/showmate)

> A full-stack movie & show ticketing platform inspired by BookMyShow — with a built-in loyalty rewards system. Users earn points on every booking and redeem them for real cashback.

</div>

---

## Live Links

| Platform | URL |
|----------|-----|
| Frontend (Vercel) | https://showmate-sable.vercel.app |
|  Backend API (Render) | https://showmate.onrender.com/api |
|  Database | MongoDB Atlas (Cloud) |

---

##  Features

- **Movie & Show Browsing** — Filter by language, genre, rating, points
- **Smart Search** — Search by title, cast, director, genre
- **Interactive Seat Selection** — Regular, Premium, Recliner seats
- **Real Payment Gateway** — Razorpay integration (test + live mode)
- **Loyalty Points System** — Earn points on every booking automatically
- **5 Loyalty Tiers** — Bronze → Silver → Gold → Platinum → Diamond
- **Points Redemption** — Redeem points for wallet cashback
- **User Authentication** — JWT-based secure login & register
- **Responsive Design** — Works on mobile, tablet, desktop
- **Protected Routes** — Booking & profile require login

---

## Screenshots

### Home Page
![Home Page](./screenshots/home.png)
> Auto-rotating hero banner with trending movies, loyalty tier showcase, and points widget

### Movies & Shows Page
![Movies Page](./screenshots/movies.png)
> Filter by tab (Movies/Shows/Events/Offers), language, genre — sort by rating, points, newest

### Seat Selection
![Booking Page](./screenshots/select.png)
> Interactive seat map with Regular, Premium, and Recliner categories

### Payment (Razorpay)
![Payment](./screenshots/payment.png)
> Secure payment via Razorpay — supports cards, UPI, net banking

### Profile & Rewards
![Profile](./screenshots/profile.png)
> Points history, tier progress bar, wallet balance, redeem points for cashback

---

##  Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 + Vite | UI framework & build tool |
| React Router v6 | Client-side routing |
| Tailwind CSS | Styling & responsive design |
| Context API | Global auth state management |
| Razorpay JS SDK | Payment modal |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JWT | Authentication tokens |
| bcryptjs | Password hashing |
| Razorpay Node SDK | Payment order creation & verification |
| CORS | Cross-origin request handling |

### DevOps & Deployment
| Service | Purpose |
|---------|---------|
| GitHub | Version control & monorepo |
| Vercel | Frontend deployment (auto CI/CD) |
| Render | Backend deployment (auto CI/CD) |
| MongoDB Atlas | Cloud database (free tier) |

---

## Project Structure

```
showmate/                        ← Monorepo root
├── frontend/                    ← React + Vite app
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── MovieCard.jsx
│   │   │   └── PointsWidget.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Movies.jsx
│   │   │   ├── MovieDetail.jsx
│   │   │   ├── Booking.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Auth.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   └── data/
│   │       └── mockData.js
│   ├── package.json
│   └── vite.config.js
│
└── backend/                     ← Node.js + Express API
    ├── models/
    │   ├── User.js
    │   ├── Movie.js
    │   └── Booking.js
    ├── routes/
    │   ├── auth.js
    │   ├── movies.js
    │   ├── bookings.js
    │   ├── points.js
    │   ├── payment.js
    │   └── user.js
    ├── middleware/
    │   └── auth.js
    ├── server.js
    └── package.json
```

---

##  Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free)
- Razorpay account (free test mode)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/showmate.git
cd showmate
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/showmate
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxx
PORT=5000
CLIENT_URL=http://localhost:5173
```

```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
cp .env.example .env
```

Fill in `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

### 4. Seed Movies
```bash
# Hit this in Postman or browser
POST http://localhost:5000/api/movies/seed
```

### 5. Open App
```
http://localhost:5173
```

---

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user (+100 welcome points) |
| POST | `/api/auth/login` | Login with email & password |
| GET | `/api/auth/me` | Get current logged in user |

### Movies
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/movies` | Get all movies (with filters) |
| GET | `/api/movies/trending` | Get trending movies |
| GET | `/api/movies/:id` | Get single movie |
| POST | `/api/movies/seed` | Seed initial movie data |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create new booking (after payment) |
| GET | `/api/bookings/my` | Get all my bookings |
| GET | `/api/bookings/:id` | Get single booking |
| DELETE | `/api/bookings/:id` | Cancel booking |

### Points
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/points/summary` | Get points summary + tier info |
| GET | `/api/points/history` | Get points transaction history |
| POST | `/api/points/redeem` | Redeem points for wallet cash |
| GET | `/api/points/tiers` | Get all tier information |

### Payment
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payment/create-order` | Create Razorpay order |
| POST | `/api/payment/verify` | Verify payment signature |

---

## Loyalty Points System

| Tier | Points Required | Cashback Reward |
|------|----------------|-----------------|
| Bronze | 0 — 499 pts | — |
| Silver | 500 — 1499 pts | ₹50 |
| Gold | 1500 — 2999 pts | ₹150 |
| Platinum | 3000 — 4999 pts | ₹350 |
| Diamond | 5000+ pts | ₹700 |

### Points earned per booking:
- Regular movie → **+90 to +150 pts**
- Web series / Shows → **+80 to +95 pts**
- Welcome bonus → **+100 pts** (on registration)
- Weekend bonus → **2x points** (Gold+ members)

### Redemption Rate:
```
500 points = ₹50 cashback (credited to ShowMate Wallet)
```

---

## Razorpay Test Credentials

```
Card Number : 5267 3181 8797 5449
Expiry      : 12/26
CVV         : 123
OTP         : 1234

UPI         : success@razorpay
```

---

## Database Schema

### User
```json
{
  "name": "Adamya Mehta",
  "email": "adamya@example.com",
  "password": "hashed_with_bcrypt",
  "points": 1840,
  "walletBalance": 150,
  "tier": "Gold",
  "totalBookings": 12,
  "pointsHistory": []
}
```

### Booking
```json
{
  "user": "ObjectId",
  "movieTitle": "Ramayan",
  "theatre": "PVR IMAX",
  "showTime": "7:30 PM",
  "seats": [{"id": "F4", "type": "premium", "price": 380}],
  "finalAmount": 490,
  "pointsEarned": 150,
  "paymentStatus": "paid",
  "bookingRef": "SM-2026-ABC123"
}
```

---

## Developer

**Adamya Mehta**
- 4th Year Computer Science Student
- Project: ShowMate — College Final Year Project

---

## License

This project is built for educational purposes as a college project.

---

<div align="center">

Made with ❤️ for cinema lovers 🎬

**ShowMate** — Book. Earn. Reward.

</div>