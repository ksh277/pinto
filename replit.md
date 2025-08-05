# Pinto E-commerce Platform

## Overview
Pinto is a full-stack Korean-style e-commerce web application for custom printing services. It enables users to create personalized merchandise such as acrylic keychains, stickers, t-shirts, and phone cases. The platform aims to provide a comprehensive solution for customers seeking custom printed items and for administrators managing the service. The business vision is to capture market potential in personalized goods, offering a unique blend of customizability and Korean design aesthetics.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **Routing**: Wouter
- **State Management**: TanStack Query
- **Theme System**: Light mode only (dark mode removed for simplified UI).
- **UI/UX Decisions**: Korean-first design with responsive, mobile-first approach. Employs a clean white background throughout the platform. Standardized card designs (`allprint-card`) with specific dimensions, image/text ratios, typography, and badges for visual consistency across the platform. Emphasizes interactive elements, animations, and professional layouts.

### Backend Architecture
- **Server**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: PostgreSQL-backed sessions with `connect-pg-simple`
- **File Storage**: Planned for user uploads and product images.

### Key Design Decisions
- **Monorepo Structure**: Shared schema and types between client and server for full type safety.
- **Component-based UI**: Modular, reusable components following shadcn/ui patterns.
- **Internationalization**: Primary language is Korean with English toggle support.
- **Performance**: Optimized builds, lazy loading, and scroll-triggered animations.
- **Scalability**: Modular architecture supports growth.
- **Authentication**: Username-based login, JWT token system, and role-based access control.
- **Cart & Order Flow**: Comprehensive localStorage-based cart system with integration into a multi-step order processing and payment flow.

### Feature Specifications
- **Product Management**: CRUD operations for products, categories, and options with real-time price calculation.
- **Customization Editor**: Full-featured web editor for custom goods customization with image manipulation, size control, and double-sided editing. Includes product selection via a visual card-based interface with custom character illustrations.
- **User Management**: Authentication, profiles, and preferences.
- **Order Processing**: Full cart to checkout flow with order tracking and payment integrations.
- **Review System**: Product reviews and ratings with user-generated content showcase.
- **Community Features**: Q&A board, design sharing, events, and resource libraries.
- **Rewards & Membership**: Tiered membership system with coupons and benefits.
- **Wishlist System**: User wishlist management with sorting and interactive features.
- **Admin Dashboard**: Management of products, sections, additional services, users, orders, and system settings. Includes a template management system.

## External Dependencies

### Core Dependencies
- **React Ecosystem**: React 18, React Query, React Hook Form
- **UI Components**: Radix UI primitives with shadcn/ui styling
- **Database**: Drizzle ORM with PostgreSQL dialect
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation

### Development Tools
- **Build**: Vite with TypeScript support
- **Database**: Drizzle Kit for migrations and schema management
- **Development**: TSX for running TypeScript

### Integrated Services
- **Database/Backend-as-a-Service**: Supabase for database integration, authentication, and real-time features.
- **Payment**: Toss Payments (card) and KakaoPay (mobile).
- **Social Login**: Google and Kakao (planned).
- **File Storage**: Cloud storage for user uploads (planned).
- **Analytics**: User behavior tracking (planned).
- **Email**: Order confirmations and notifications (planned).

## Recent Changes

### 2025-08-03: Complete Database Integration & Production Readiness
- **Complete MySQL Migration**: Successfully migrated all schemas from PostgreSQL to MySQL with full type compatibility
  - 15+ table schemas with proper relationships and constraints
  - Korean language support (nameKo, descriptionKo fields) across all content tables
  - Type-safe operations through Drizzle ORM with comprehensive validation
- **Full API Coverage**: Implemented all CRUD operations for production features
  - User authentication with JWT token system and session management
  - Product management with categories, reviews, cart, and order processing
  - Community features with posts, comments, and interaction capabilities
  - Admin dashboard with full product and order management
- **Data Validation & Testing**: Verified all database operations working correctly
  - 7 categories successfully populated with Korean translations
  - Product creation, review system, cart functionality all operational
  - Community post creation and comment system fully functional
  - Order processing and payment tracking systems ready
- **Production Database Architecture**: 
  - Comprehensive table relationships with foreign key constraints
  - JSON fields for flexible customization options and design data
  - Proper indexing and performance optimization for scaled usage
  - Complete data integrity with proper error handling
- **Feature Completeness**: All 15+ pages connected to respective database tables
  - Real-time data persistence and retrieval across all user interactions
  - Full Korean localization support throughout the platform
  - Admin management capabilities for products, users, and orders

### 2025-08-04: Dark Mode Removal & UI Simplification  
- **Complete Dark Mode Removal**: Eliminated all dark mode related code for simplified maintenance
- **Light Mode Only**: Streamlined to use only light theme throughout the application
- **CSS Cleanup**: Removed 1000+ lines of dark mode styles, keeping only essential light mode CSS
- **Component Updates**: Updated ThemeProvider, ThemeToggle, and Header components for light mode only
- **Tailwind Config**: Removed darkMode configuration, simplified color system
- **User Experience**: Consistent white background with clean, professional appearance

### 2025-01-12: Complete Pinto Editor UI Redesign & Layout Fix
- **Fixed Critical Layout Bug**: Completely refactored DraggableElement component to eliminate offset issues
- **Modern Mobile-First Design**: Built warm, contemporary UI with mint (#00C19D) and blue (#0A84FF) color scheme
- **Enhanced Canvas Architecture**: 300x300px canvas with proper relative positioning context
- **Professional Tool Interface**: 4 tool tabs with mobile-optimized navigation
- **Advanced Element Controls**: Mint-colored resize handles with improved visual feedback
- **Typography & Interaction**: Pretendard/Noto Sans KR fonts, touch-optimized interface

### 2025-08-05: Social Login Integration Complete
- **OAuth Implementation**: Complete Naver and Kakao social login system
- **Authentication Flow**: Authorization Code Grant with CSRF protection and state validation
- **JWT Integration**: Unified authentication using JWT tokens for all login methods
- **User Management**: Automatic user registration/login with social profile data integration
- **Frontend Integration**: Seamless social login buttons with automatic token processing
- **Security**: Session-based state management and secure redirect handling