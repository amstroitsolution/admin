# Admin Panel Guide

## Overview
This admin panel manages all content sections for the Goodluck Textile website, organized according to the frontend structure.

## Admin Sections

### 1. **Dashboard Overview**
- Quick stats for all sections
- Recent activity
- Quick action buttons

### 2. **Homepage Sections**

#### Hero Banner
- Manage homepage hero slides/banners
- Features:
  - Title, subtitle, and description
  - Background image URL
  - Optional video URL
  - Call-to-action button (text & link)
  - Active/inactive toggle
  - Order management for multiple slides

#### Our Values
- Company values and principles
- Features:
  - Title and description
  - Emoji/icon
  - Order management
  - Active/inactive toggle

#### Slow Fashion Finds & Trendsetters
- Sustainable fashion content
- Features:
  - Title and description
  - Image
  - Category
  - Button text and link
  - Tags
  - Order management

#### Watch & Buy Collection
- Video collection showcase
- Features:
  - Title and description
  - Media upload (video/image)
  - Thumbnail
  - Category
  - Active/inactive toggle

### 3. **Equipment & Services**

#### View Equipment
- List all equipment
- Edit and delete functionality
- Image gallery for each item

#### Add Equipment
- Create new equipment listings
- Upload multiple images
- Set price and type

#### Home Services
- Manage service offerings
- Carousel content

### 4. **Gallery & Portfolio**

#### Add Gallery
- Create new gallery collections
- Upload multiple images
- Set cover image

#### View Galleries
- List all galleries
- View, edit, and delete

#### Our Recent Works
- Portfolio/work showcase
- Add and manage work items

## API Endpoints

### Hero Section
- `GET /api/hero` - Get all hero slides
- `GET /api/hero/active` - Get active slides only
- `GET /api/hero/:id` - Get specific slide
- `POST /api/hero` - Create new slide (auth required)
- `PUT /api/hero/:id` - Update slide (auth required)
- `DELETE /api/hero/:id` - Delete slide (auth required)

### Our Values
- `GET /api/our-values` - Get all values
- `POST /api/our-values` - Create new value (auth required)
- `PUT /api/our-values/:id` - Update value (auth required)
- `DELETE /api/our-values/:id` - Delete value (auth required)

### Slow Fashion
- `GET /api/slow-fashion` - Get all items
- `POST /api/slow-fashion` - Create new item (auth required)
- `PUT /api/slow-fashion/:id` - Update item (auth required)
- `DELETE /api/slow-fashion/:id` - Delete item (auth required)

### Watch & Buy
- `GET /api/watchbuy` - Get all items
- `POST /api/watchbuy` - Create new item (auth required)
- `PUT /api/watchbuy/:id` - Update item (auth required)
- `DELETE /api/watchbuy/:id` - Delete item (auth required)

### Equipment
- `GET /api/equipment` - Get all equipment
- `POST /api/equipment` - Create new equipment (auth required)
- `PUT /api/equipment/:id` - Update equipment (auth required)
- `DELETE /api/equipment/:id` - Delete equipment (auth required)

### Gallery
- `GET /api/gallery` - Get all galleries
- `POST /api/gallery` - Create new gallery (auth required)
- `DELETE /api/gallery/:id` - Delete gallery (auth required)

### Works
- `GET /api/works` - Get all works
- `POST /api/works` - Create new work (auth required)
- `PUT /api/works/:id` - Update work (auth required)
- `DELETE /api/works/:id` - Delete work (auth required)

## Setup Instructions

### Backend Setup
1. Navigate to backend folder: `cd backend`
2. Install dependencies: `npm install`
3. Create `.env` file with:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
4. Seed initial data:
   ```
   npm run seed:hero
   npm run seed:our-values
   npm run seed:slow-fashion
   ```
5. Start server: `npm start`

### Admin Panel Setup
1. Navigate to admin folder: `cd admin`
2. Install dependencies: `npm install`
3. Create `.env` file with:
   ```
   VITE_API_BASE_URL=http://localhost:5000
   ```
4. Start dev server: `npm run dev`
5. Access admin at: `http://localhost:5174/admin/login`

## Default Admin Credentials
Check `backend/seed/createAdmin.js` for default credentials or create a new admin user.

## Features

### Authentication
- JWT-based authentication
- Protected routes
- Token stored in localStorage

### Image Management
- Drag & drop upload
- Multiple image support
- Preview before upload
- URL-based images supported

### Content Organization
- Sections organized by frontend structure
- Order management for items
- Active/inactive toggles
- Quick actions from overview

### Responsive Design
- Mobile-friendly sidebar
- Adaptive layouts
- Touch-friendly controls

## Tips

1. **Hero Slides**: Use high-quality images (1920x1080 recommended)
2. **Order Management**: Lower numbers appear first
3. **Active Toggle**: Inactive items won't show on frontend
4. **Image URLs**: Can use external URLs or upload to server
5. **Refresh**: Use refresh button to see latest data

## Troubleshooting

### Can't login?
- Check if backend is running
- Verify MongoDB connection
- Check admin credentials

### Images not showing?
- Verify image URLs are accessible
- Check CORS settings
- Ensure uploads folder has proper permissions

### API errors?
- Check backend console for errors
- Verify API_BASE_URL in .env
- Check network tab in browser devtools

## Support
For issues or questions, check the backend logs and browser console for detailed error messages.
