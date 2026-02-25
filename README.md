# RevOps - Garage Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.1-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.5.0-47A248.svg)](https://www.mongodb.com/)

A comprehensive garage operations and financial control system designed for workshop owners and managers. Built with complete transparency, job lifecycle tracking, payment management, and powerful analytics.

![RevOps Dashboard](https://images.unsplash.com/photo-1549047608-55b2fd4b8427?w=800)

## 🎯 Key Features

### For Workshop Owners
- 📊 **Real-time Analytics Dashboard** - Revenue trends, manager performance, job statistics
- 👥 **Manager Management** - Invite-based onboarding with unique codes
- 💰 **Payment Confirmation** - Full transparency with owner approval workflow
- 📈 **Data Analytics** - 30-day revenue trends, credit risk detection, forecasting
- 📥 **Excel Export** - Export 100,000+ job records for analysis
- 🔐 **Complete Control** - View all jobs, confirm all payments, manage all managers

### For Managers
- 🚗 **Job Management** - Complete lifecycle from intake to delivery
- 💳 **Payment Recording** - Track advance, partial, and final payments
- 📋 **Status Updates** - 7-stage job status tracking
- 👷 **Worker Assignment** - Assign and track worker productivity
- 📄 **Document Generation** - Job cards and invoices with one click

### Core Capabilities
- ✅ Dual authentication (JWT + Google OAuth support)
- ✅ Role-based access control (Owner/Manager isolation)
- ✅ PDF generation (Job cards, GST invoices)
- ✅ Settlement tracking (Manager → Owner money flow)
- ✅ Credit management with outstanding tracking
- ✅ Mobile-responsive design
- ✅ Scalable to 50+ managers, 100K+ jobs

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Browser    │  │    Mobile    │  │   Tablet     │     │
│  │  (React 19)  │  │   (Future)   │  │  (Responsive)│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓
                         HTTPS
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND LAYER                            │
│  ┌────────────────────────────────────────────────────┐    │
│  │  React Application (Port 3000)                     │    │
│  │  • React Router (Client-side routing)             │    │
│  │  • Axios (API communication)                       │    │
│  │  • Recharts (Analytics visualization)             │    │
│  │  • Shadcn/UI + Tailwind CSS (UI Components)       │    │
│  │  • AuthContext (Global state management)          │    │
│  │  • Framer Motion (Animations)                     │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    REST API (/api/*)
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND LAYER                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │  FastAPI Application (Port 8001)                   │    │
│  │                                                     │    │
│  │  API Routes:                                        │    │
│  │  ├─ /api/auth/*        (Authentication)           │    │
│  │  ├─ /api/workshops/*   (Workshop management)       │    │
│  │  ├─ /api/managers/*    (Manager operations)        │    │
│  │  ├─ /api/jobs/*        (Job CRUD + lifecycle)      │    │
│  │  ├─ /api/payments/*    (Payment tracking)          │    │
│  │  ├─ /api/settlements/* (Money settlement)          │    │
│  │  ├─ /api/analytics/*   (Dashboard analytics)       │    │
│  │  └─ /api/documents/*   (PDF generation)            │    │
│  │                                                     │    │
│  │  Middleware:                                        │    │
│  │  • CORS (Cross-Origin Resource Sharing)           │    │
│  │  • JWT Authentication                              │    │
│  │  • Error Handling                                  │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↓
                  MongoDB Connection
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE LAYER                            │
│  ┌────────────────────────────────────────────────────┐    │
│  │  MongoDB (Motor - Async Driver)                    │    │
│  │                                                     │    │
│  │  Collections:                                       │    │
│  │  ├─ users          (Owner & Manager accounts)     │    │
│  │  ├─ workshops      (Workshop profiles)            │    │
│  │  ├─ invite_codes   (Manager invite system)        │    │
│  │  ├─ managers       (Manager-Workshop mapping)     │    │
│  │  ├─ jobs           (Job records + lifecycle)      │    │
│  │  ├─ job_updates    (Job history timeline)         │    │
│  │  ├─ payments       (Payment transactions)         │    │
│  │  └─ settlements    (Manager settlements)          │    │
│  │                                                     │    │
│  │  Indexes: user.email, job.workshop_id,            │    │
│  │           job.manager_id, payment.job_id          │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                         │
│  ├─ ReportLab (PDF Generation)                             │
│  ├─ XlsxWriter (Excel Export)                              │
│  └─ Google OAuth (Future: Social Login)                    │
└─────────────────────────────────────────────────────────────┘
```

## 🗄️ Database Schema

### Collections & Relationships

```
users
├─ id (UUID, Primary Key)
├─ email (String, Unique)
├─ password_hash (String)
├─ name (String)
├─ phone (String)
├─ role (Enum: 'owner', 'manager')
└─ created_at (DateTime)

workshops
├─ id (UUID, Primary Key)
├─ owner_id (UUID, Foreign Key → users.id)
├─ name (String)
├─ address (String)
├─ phone (String)
├─ gst_number (String)
└─ created_at (DateTime)

invite_codes
├─ id (UUID, Primary Key)
├─ code (String, Unique, 8 chars)
├─ workshop_id (UUID, Foreign Key → workshops.id)
├─ created_by (UUID, Foreign Key → users.id)
├─ is_active (Boolean)
├─ used_by (UUID, Foreign Key → users.id)
├─ used_at (DateTime)
└─ created_at (DateTime)

managers
├─ id (UUID, Primary Key)
├─ user_id (UUID, Foreign Key → users.id)
├─ workshop_id (UUID, Foreign Key → workshops.id)
├─ joined_at (DateTime)
├─ is_active (Boolean)
└─ permissions (JSON)

jobs
├─ id (UUID, Primary Key)
├─ workshop_id (UUID, Foreign Key → workshops.id)
├─ manager_id (UUID, Foreign Key → users.id)
├─ customer_name (String)
├─ phone (String)
├─ car_model (String)
├─ vehicle_number (String)
├─ work_description (Text)
├─ estimated_amount (Float)
├─ advance_paid (Float)
├─ planned_completion_days (Integer)
├─ status (Enum: 7 statuses)
├─ address (String, Optional)
├─ parts_required (Text, Optional)
├─ worker_assigned (String, Optional)
├─ internal_notes (Text, Optional)
├─ created_at (DateTime)
├─ updated_at (DateTime)
└─ completed_at (DateTime)

job_updates
├─ id (UUID, Primary Key)
├─ job_id (UUID, Foreign Key → jobs.id)
├─ updated_by (UUID, Foreign Key → users.id)
├─ update_type (String)
├─ description (Text)
└─ timestamp (DateTime)

payments
├─ id (UUID, Primary Key)
├─ job_id (UUID, Foreign Key → jobs.id)
├─ amount (Float)
├─ payment_type (Enum: 'advance', 'partial', 'final')
├─ notes (Text)
├─ collected_by_manager_id (UUID, Foreign Key → users.id)
├─ confirmed_by_owner (Boolean)
├─ payment_date (DateTime)
└─ confirmation_date (DateTime)

settlements
├─ id (UUID, Primary Key)
├─ manager_id (UUID, Foreign Key → users.id)
├─ workshop_id (UUID, Foreign Key → workshops.id)
├─ amount (Float)
├─ job_ids (Array of UUIDs)
├─ notes (Text)
├─ submitted_date (DateTime)
├─ confirmed_by_owner (Boolean)
└─ confirmation_date (DateTime)
```

## 🚀 Quick Start

### Prerequisites

```bash
# Required
- Python 3.11+
- Node.js 18+
- MongoDB 4.5+
- Yarn 1.22+
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/revops-garage-management.git
cd revops-garage-management
```

2. **Backend Setup**
```bash
cd backend
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URL, JWT secret, etc.
```

3. **Frontend Setup**
```bash
cd frontend
yarn install

# Configure environment variables
cp .env.example .env
# Edit .env with your backend URL
```

4. **Start MongoDB**
```bash
# Using Docker
docker run -d -p 27017:27017 --name revops-mongo mongo:4.5

# Or use local MongoDB installation
mongod --dbpath /path/to/data
```

5. **Run the Application**

```bash
# Terminal 1 - Backend
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 8001

# Terminal 2 - Frontend
cd frontend
yarn start
```

6. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001
- API Docs: http://localhost:8001/docs

## 📁 Project Structure

```
revops-garage-management/
├── backend/
│   ├── server.py              # Main FastAPI application
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # Environment variables
│   └── README.md             # Backend documentation
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/            # Shadcn/UI components
│   │   │   └── DashboardLayout.js
│   │   ├── context/
│   │   │   └── AuthContext.js # Authentication state
│   │   ├── pages/
│   │   │   ├── LandingPage.js
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── WorkshopSetup.js
│   │   │   ├── OwnerDashboard.js
│   │   │   ├── ManagerDashboard.js
│   │   │   ├── JobsList.js
│   │   │   ├── JobDetail.js
│   │   │   ├── CreateJob.js
│   │   │   ├── ManagersPage.js
│   │   │   └── PaymentsPage.js
│   │   ├── services/
│   │   │   └── api.js         # API client
│   │   ├── App.js             # Main app component
│   │   ├── App.css            # Global styles
│   │   └── index.css          # Tailwind + custom CSS
│   ├── package.json
│   ├── tailwind.config.js
│   ├── .env
│   └── README.md
│
├── .gitignore
├── README.md                  # This file
├── ARCHITECTURE.md            # Detailed architecture
└── LICENSE
```

## 🔐 Authentication Flow

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Client    │         │   Backend   │         │   MongoDB   │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                       │
       │ POST /api/auth/login  │                       │
       │ {email, password}     │                       │
       ├──────────────────────>│                       │
       │                       │ Query user by email   │
       │                       ├──────────────────────>│
       │                       │                       │
       │                       │<──────────────────────┤
       │                       │ Verify password hash  │
       │                       │                       │
       │                       │ Generate JWT token    │
       │                       │ (7-day expiration)    │
       │                       │                       │
       │ {token, user}         │                       │
       │<──────────────────────┤                       │
       │                       │                       │
       │ Store in localStorage │                       │
       │                       │                       │
       │ GET /api/jobs         │                       │
       │ Header: Bearer token  │                       │
       ├──────────────────────>│                       │
       │                       │ Verify JWT signature  │
       │                       │ Extract user info     │
       │                       │                       │
       │                       │ Query jobs            │
       │                       ├──────────────────────>│
       │                       │<──────────────────────┤
       │                       │                       │
       │ {jobs: [...]}         │                       │
       │<──────────────────────┤                       │
       │                       │                       │
```

## 🎨 Design System

### Theme: "Performance Pro"
- **Philosophy**: Tactical Minimalism for Workshop Environments
- **Primary Color**: Electric Red (#dc2626)
- **Background**: Deep Obsidian (#09090b)
- **Cards**: Dark Grey (#18181b)

### Typography
- **Headings**: Barlow Condensed (Athletic, Strong)
- **Body**: Inter (Clean, Readable)
- **Data/Numbers**: JetBrains Mono (Technical, Precise)

### Components
- Flat design with subtle borders
- Sharp corners (rounded-sm)
- No soft shadows
- Tactical button feedback (active:scale-95)
- Tracing beam effects on high-value cards

## 🧪 Testing

### Backend API Testing
```bash
# Run pytest
cd backend
pytest

# Run with coverage
pytest --cov=. --cov-report=html
```

### Frontend Testing
```bash
cd frontend
yarn test
```

### Manual E2E Testing
```bash
# Complete owner flow test script
bash scripts/test_owner_flow.sh

# Manager flow test
bash scripts/test_manager_flow.sh
```

## 📊 Analytics Features

### Owner Dashboard Metrics
- **Revenue Tracking**: Daily, weekly, monthly trends
- **Job Statistics**: Total, pending, completed counts
- **Manager Performance**: Revenue per manager, job completion rates
- **Credit Management**: Outstanding payments, risk detection
- **Trend Analysis**: 30-day revenue chart with area visualization

### Data Export
- Export jobs to Excel (.xlsx)
- Support for 100,000+ records
- Includes all job details, payments, status

## 🔒 Security

- ✅ Password hashing with bcrypt (salt rounds: 12)
- ✅ JWT tokens with 7-day expiration
- ✅ Role-based access control (RBAC)
- ✅ MongoDB injection prevention (parameterized queries)
- ✅ CORS configuration for production
- ✅ Input validation with Pydantic
- ✅ Secure HTTP headers

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Manual Deployment
```bash
# Backend (Production)
cd backend
gunicorn server:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001

# Frontend (Build)
cd frontend
yarn build
# Serve the build folder with nginx or any static server
```

### Environment Variables

**Backend (.env)**
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=revops_garage
JWT_SECRET=your-secret-key-change-in-production
CORS_ORIGINS=https://yourdomain.com
```

**Frontend (.env)**
```env
REACT_APP_BACKEND_URL=https://api.yourdomain.com
```

## 📈 Scaling Guidelines

### Database Optimization
```javascript
// Recommended MongoDB indexes
db.users.createIndex({ "email": 1 }, { unique: true })
db.jobs.createIndex({ "workshop_id": 1, "created_at": -1 })
db.jobs.createIndex({ "manager_id": 1, "status": 1 })
db.payments.createIndex({ "job_id": 1 })
```

### Performance Tips
- Use MongoDB aggregation pipelines for complex analytics
- Implement Redis caching for dashboard analytics
- Enable CDN for static assets
- Use pagination for large job lists
- Implement lazy loading for images

## 🛣️ Roadmap

### Phase 1 (Current - MVP) ✅
- [x] Owner and Manager authentication
- [x] Workshop management
- [x] Job lifecycle tracking
- [x] Payment management
- [x] Analytics dashboard
- [x] PDF generation

### Phase 2 (Next)
- [ ] Mobile app (React Native)
- [ ] WhatsApp integration for documents
- [ ] Email notifications
- [ ] Photo upload for jobs
- [ ] Worker role and module
- [ ] Google OAuth integration

### Phase 3 (Future)
- [ ] Advanced analytics (ML forecasting)
- [ ] Fraud detection patterns
- [ ] Multi-workshop support
- [ ] API for third-party integrations
- [ ] Mobile payment gateway integration
- [ ] Voice-based job updates

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Sreehari** - *Initial work* - Workshop owner and system architect

## 🙏 Acknowledgments

- FastAPI for the amazing backend framework
- Shadcn/UI for beautiful React components
- MongoDB for flexible data storage
- The open-source community

## 📞 Support

- 📧 Email: support@revops.com
- 💬 Discord: [Join our community](https://discord.gg/revops)
- 📖 Documentation: [docs.revops.com](https://docs.revops.com)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/revops-garage-management/issues)

## 📸 Screenshots

### Owner Dashboard
![Owner Dashboard](screenshots/owner-dashboard.png)

### Manager Job Creation
![Job Creation](screenshots/job-creation.png)

### Analytics
![Analytics](screenshots/analytics.png)

---

**Built with ❤️ for Workshop Owners who demand transparency and control**
