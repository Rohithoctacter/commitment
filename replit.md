# Overview

This is a goal tracking application built with React (frontend) and Express.js (backend). The app allows users to create daily commitment goals, track their progress, and manage check-ins over a specified period. The application uses a modern full-stack architecture with TypeScript throughout, featuring a clean UI built with shadcn/ui components and Tailwind CSS.

The core functionality revolves around helping users maintain daily habits by setting goals for a specific number of days and tracking their completion through a simple check-in system.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development/build tooling
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management, local React state for UI state
- **Styling**: Tailwind CSS with shadcn/ui component library providing pre-built, accessible components
- **Form Handling**: React Hook Form with Zod validation schemas
- **UI Components**: Comprehensive set of Radix UI primitives wrapped in shadcn/ui components

## Backend Architecture  
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful API with endpoints for goal creation, retrieval, check-ins, and resets
- **Data Storage**: Currently using in-memory storage (MemStorage class) with interface-based design for easy database integration
- **Schema Validation**: Drizzle ORM schemas with Zod validation for type-safe API contracts
- **Development**: Hot reload with tsx for development server

## Data Storage Solutions
- **Current**: In-memory storage using Map data structure for development/testing
- **Planned**: PostgreSQL with Drizzle ORM (configuration already present)
- **Schema Design**: Goals table with fields for tracking progress, timestamps, and active status
- **Session Management**: Connect-pg-simple for PostgreSQL session storage

## Development & Build
- **Monorepo Structure**: Shared schemas and types between client/server in `/shared` directory
- **Build Process**: Vite for frontend bundling, esbuild for backend compilation
- **Development Tools**: TSX for development server, Drizzle Kit for database migrations
- **Path Aliases**: Configured for clean imports (@/, @shared/, @assets/)

## Key Design Patterns
- **Interface-based Storage**: Storage layer uses IStorage interface allowing swap between memory and database implementations
- **Shared Type Safety**: Common schemas and types shared between frontend and backend
- **Component Composition**: shadcn/ui components built on Radix UI primitives for accessibility and customization
- **Server State Management**: React Query handles API state, caching, and synchronization

# External Dependencies

## Database & ORM
- **Drizzle ORM**: Type-safe database operations with PostgreSQL dialect
- **@neondatabase/serverless**: Serverless PostgreSQL driver for Neon database
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## Frontend Libraries
- **React Ecosystem**: React 18, React DOM, React Hook Form
- **UI Framework**: Complete shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS, class-variance-authority for component variants, clsx for conditional classes
- **State Management**: TanStack React Query for server state
- **Utilities**: date-fns for date manipulation, lucide-react for icons

## Development Tools
- **Build Tools**: Vite, esbuild, TypeScript compiler
- **Development**: tsx for TypeScript execution, @replit/vite-plugin-runtime-error-modal for error handling
- **Database**: Drizzle Kit for schema management and migrations

## Validation & Types
- **Runtime Validation**: Zod schemas for API validation
- **ORM Integration**: drizzle-zod for automatic schema-to-Zod conversion
- **Type Safety**: Full TypeScript coverage across frontend, backend, and shared code