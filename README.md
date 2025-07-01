# Kinetic Flow AI - Frontend Only

A modern physiotherapy and rehabilitation platform built with Next.js 14, designed as a frontend-only application that can be deployed to Vercel.

## 🚀 Features

- **Patient Dashboard**: Comprehensive view of appointments, exercises, and progress
- **Provider Dashboard**: Tools for managing patients and tracking their progress
- **Exercise Library**: Interactive exercise demonstrations and tracking
- **Appointment Management**: Schedule and manage therapy sessions
- **Progress Tracking**: Visual charts and metrics for rehabilitation progress
- **Real-time Pose Analysis**: AI-powered movement analysis (simulated)
- **Messaging System**: Communication between patients and providers
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Charts**: Recharts
- **Icons**: Lucide React
- **Data Storage**: localStorage (frontend simulation)
- **Authentication**: Mock authentication system

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd kinetic-flow-ai-main
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Deployment

This application is designed to be deployed as a static frontend application:

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Deploy automatically with zero configuration

### Other Static Hosting
```bash
npm run build
npm run export
```

Then deploy the `out` folder to any static hosting service.

## 🎮 Demo Accounts

The application includes demo accounts for testing:

**Patient Account:**
- Email: `patient@demo.com`
- Password: `demo123`

**Provider Account:**
- Email: `provider@demo.com`
- Password: `demo123`

Or use the "Demo Quick Login" buttons on the login pages.

## 🔧 Architecture

This is a **frontend-only application** that simulates backend functionality:

- **Data Storage**: Uses localStorage to persist data across sessions
- **API Simulation**: Mock API calls with realistic delays using setTimeout
- **Authentication**: Simulated login/logout with session management
- **File Uploads**: Metadata-only simulation (no actual file storage)
- **Real-time Features**: Simulated using local state management

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard pages
│   ├── login/            # Authentication pages
│   ├── exercises/        # Exercise library
│   └── components/       # Page-specific components
├── components/           # Reusable UI components
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and mock data
└── public/             # Static assets
```

## 🎯 Key Features Explained

### Mock Data System
The application uses a sophisticated mock data system (`lib/mock-data.ts`) that:
- Simulates realistic API delays
- Persists data using localStorage
- Provides CRUD operations for all entities
- Maintains data relationships

### Authentication
Simulated authentication system that:
- Validates credentials against mock user data
- Manages user sessions with localStorage
- Supports role-based access (patient/provider)
- Includes password reset simulation

### Data Persistence
All user interactions are saved locally:
- Appointments and scheduling
- Exercise progress and metrics
- Messages and communications
- User preferences and settings

## 🔄 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features
1. Add mock data structures to `lib/mock-data.ts`
2. Create API simulation functions
3. Build UI components using existing patterns
4. Ensure localStorage persistence

## 🎨 UI/UX

The application features:
- Modern, clean design with Tailwind CSS
- Responsive layout for all screen sizes
- Accessible components from Shadcn/ui
- Consistent color scheme and typography
- Smooth animations and transitions

## 📱 Mobile Support

Fully responsive design that works on:
- Desktop computers
- Tablets
- Mobile phones
- Progressive Web App capabilities

## 🔒 Security Notes

Since this is a frontend-only demo application:
- No real user data is stored
- All data remains in the browser's localStorage
- No external API calls or database connections
- Suitable for demonstration and development purposes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Note**: This is a frontend-only demonstration application. All backend functionality is simulated using localStorage and mock data. Perfect for showcasing UI/UX capabilities and frontend development skills.