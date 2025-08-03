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
- **Theme System**: Custom theme provider with light/dark mode support, unified to a consistent `#1a1a1a` for dark mode.
- **UI/UX Decisions**: Korean-first design with responsive, mobile-first approach. Employs a clean white background for light mode and a warm navy tone (`#1a1a1a`) for dark mode. Standardized card designs (`allprint-card`) with specific dimensions, image/text ratios, typography, and badges for visual consistency across the platform. Emphasizes interactive elements, animations, and professional layouts.

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

### 2025-01-12: Complete Pinto Editor UI Redesign & Layout Fix
- **Fixed Critical Layout Bug**: Completely refactored DraggableElement component to eliminate offset issues
  - Unified image and control elements in single container with proper positioning
  - Single parent div with position: absolute contains both element content and all controls
  - Controls (resize dots, rotate/delete buttons) now move perfectly synchronized with elements
  - Eliminated separate positioning that caused green dots to float incorrectly
- **Modern Mobile-First Design**: Built warm, contemporary UI with mint (#00C19D) and blue (#0A84FF) color scheme
- **Enhanced Canvas Architecture**: 
  - 300x300px canvas with proper relative positioning context and overflow: visible
  - Grid background pattern for better visual guidance
  - Real-time canvas info display showing dimensions and selected element type
- **Professional Tool Interface**:
  - 4 tool tabs: Image Upload (📷), Text (✍️), Shapes, Layers
  - Mobile-optimized horizontal tab navigation with desktop sidebar
  - Advanced color pickers with 30+ preset colors
- **Advanced Element Controls**:
  - Mint-colored resize handles with white borders and shadow effects
  - Dashed selection outline with improved visual feedback
  - Corner and side resize handles for precise adjustments
  - Action buttons (rotate, delete) positioned relative to unified container
- **Typography & Interaction**: Pretendard/Noto Sans KR fonts, touch-optimized, gradient save button