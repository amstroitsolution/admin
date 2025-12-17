# Creative Admin Dashboard

A modern, creative admin dashboard built with React, Framer Motion, and Tailwind CSS. Features a beautiful design with animations, glassmorphism effects, and an intuitive user interface.

## 🎨 Features

### Design & UI
- **Modern Glassmorphism Design** - Beautiful glass effects with backdrop blur
- **Gradient Animations** - Dynamic color gradients with smooth transitions
- **Floating Particles** - Animated background particles for visual appeal
- **Custom Cursor** - Interactive cursor follower with hover effects
- **Responsive Layout** - Works perfectly on all device sizes

### Animations & Effects
- **Framer Motion Integration** - Smooth page transitions and micro-interactions
- **Staggered Animations** - Sequential element animations for better UX
- **Hover Effects** - 3D transforms and scaling on interactive elements
- **Loading States** - Beautiful loading spinners and skeleton screens
- **Magnetic Effects** - Elements that respond to cursor proximity

### Functionality
- **Equipment Management** - Add, edit, delete, and view equipment listings
- **Gallery Management** - Upload and organize image galleries
- **Work Portfolio** - Manage portfolio/work items
- **Home Services** - Manage service offerings
- **Real-time Updates** - Live data with automatic refresh
- **Secure Authentication** - Protected admin access

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the admin directory:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   VITE_ADMIN_EMAIL=your-admin@email.com
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173/admin/login`

## 🎯 Usage

### Login
- Use the configured admin email and password
- Secure authentication with JWT tokens
- Beautiful animated login form

### Dashboard Navigation
- **View All** - Browse all equipment listings with search and filters
- **Add Equipment** - Create new equipment with image uploads
- **Add Gallery** - Upload multiple images for galleries
- **View Galleries** - Browse and manage existing galleries
- **Our Work** - Manage portfolio items
- **Home Services** - Configure service offerings

### Key Features
- **Drag & Drop** - Upload images with drag and drop functionality
- **Real-time Preview** - See changes instantly
- **Bulk Operations** - Select and manage multiple items
- **Advanced Filtering** - Find items quickly with smart filters

## 🛠️ Technology Stack

### Frontend
- **React 19** - Latest React with concurrent features
- **Framer Motion** - Advanced animations and gestures
- **Tailwind CSS 4** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Icons** - Beautiful icon library

### Build Tools
- **Vite** - Fast build tool and dev server
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing

## 🎨 Design System

### Colors
- **Primary**: Deep burgundy (#991b1b) to red (#dc2626)
- **Secondary**: Navy (#1e293b) to slate (#334155)
- **Accent**: Gold (#f59e0b) to amber (#fbbf24)

### Typography
- **Primary Font**: Inter (clean, modern)
- **Secondary Font**: Poppins (friendly, rounded)

### Components
- **Glass Cards** - Translucent cards with backdrop blur
- **Gradient Buttons** - Multi-color gradient buttons with hover effects
- **Animated Icons** - Icons with micro-interactions
- **Status Badges** - Color-coded status indicators

## 📱 Responsive Design

The dashboard is fully responsive and optimized for:
- **Desktop** (1200px+) - Full sidebar and grid layout
- **Tablet** (768px-1199px) - Collapsible sidebar
- **Mobile** (320px-767px) - Mobile-first navigation

## 🔧 Customization

### Themes
Modify the CSS variables in `src/index.css`:
```css
:root {
  --primary: #991b1b;
  --secondary: #1e293b;
  --accent: #f59e0b;
  /* ... */
}
```

### Animations
Adjust animation settings in components:
```jsx
// Example: Modify transition duration
transition={{ duration: 0.6, ease: "easeOut" }}
```

### Layout
Customize the grid layout in Dashboard component:
```jsx
// Change grid columns
className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
```

## 🚀 Performance

### Optimizations
- **Code Splitting** - Lazy loading of components
- **Image Optimization** - Responsive images with proper sizing
- **Bundle Analysis** - Optimized bundle size
- **Caching** - Efficient caching strategies

### Best Practices
- **Accessibility** - WCAG 2.1 compliant
- **SEO** - Proper meta tags and structure
- **Security** - XSS protection and secure authentication

## 📦 Build & Deploy

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy
The built files will be in the `dist` directory. Deploy to any static hosting service like:
- Vercel
- Netlify
- AWS S3
- GitHub Pages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Framer Motion** - For incredible animation capabilities
- **Tailwind CSS** - For the utility-first CSS framework
- **React Icons** - For the beautiful icon library
- **Vite** - For the lightning-fast build tool

---

**Built with ❤️ for creative professionals**
## CI/CD Test - 12/17/2025 16:19:24
Auto-deployment enabled via GitHub Actions
