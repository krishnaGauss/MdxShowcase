# MDX Interactive Editor Platform

## Overview

An interactive MDX editor platform that provides real-time editing and preview capabilities for MDX documents with custom shortcodes. The application allows users to create, edit, and interact with MDX documents featuring custom components like yes/no questions and interactive sections. Built as a full-stack application with React frontend and Express backend, using PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, using Vite as the build tool
- **UI Library**: Radix UI primitives with shadcn/ui components for consistent design
- **Styling**: Tailwind CSS with CSS variables for theming, custom dark theme implementation
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for client-side routing with dynamic document ID support
- **Code Editor**: Monaco Editor with custom MDX language definition and syntax highlighting

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses and proper error handling
- **Request Processing**: JSON and URL-encoded body parsing with request/response logging middleware

### Data Storage
- **Database**: PostgreSQL with Neon Database serverless connection
- **ORM**: Drizzle ORM for type-safe database queries and migrations
- **Schema**: Documents table for MDX content and responses table for interactive question data
- **Fallback**: In-memory storage implementation for development/testing scenarios

### Custom MDX Processing
- **Parser**: Custom shortcode parser that transforms MDX syntax into React components
- **Components**: Extensible shortcode system supporting interactive elements
- **Rendering**: Server-side HTML generation with client-side hydration for interactive features

### Authentication and Sessions
- **Session Management**: PostgreSQL-based session storage using connect-pg-simple
- **User Tracking**: Session-based response tracking for interactive questions without requiring user accounts

### Interactive Features
- **Real-time Preview**: Live MDX rendering with custom component integration
- **Shortcodes**: Yes/no questions with response tracking and interactive highlighted sections
- **Response Analytics**: Real-time vote counting and display for question responses

### Development Experience
- **Hot Reload**: Vite HMR integration with Express server in development
- **Type Safety**: Shared TypeScript schemas between frontend and backend
- **Path Aliases**: Configured import aliases for clean code organization
- **Error Handling**: Runtime error overlays and comprehensive error boundaries

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle Kit**: Database migration and schema management tools

### UI and Styling
- **Radix UI**: Headless UI component primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework with JIT compilation
- **Lucide Icons**: Consistent icon library for UI elements

### Development Tools
- **Monaco Editor**: VS Code editor embedded for code editing experience
- **React Hook Form**: Form validation and management with Zod schema validation
- **TanStack React Query**: Server state synchronization and caching
- **Date-fns**: Date manipulation and formatting utilities

### Runtime and Build
- **Vite**: Fast build tool with plugin ecosystem for React development
- **ESBuild**: Fast JavaScript bundler for production builds
- **TSX**: TypeScript execution for development server

### Replit Integration
- **Cartographer**: Development tool integration for Replit environment
- **Runtime Error Modal**: Enhanced error reporting in development
- **Dev Banner**: Development environment indicators