# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Harbor Play Media is a self-hosted media streaming service. It allows users to browse, stream, upload, and download media files. It also supports automatic downloading (caching) of media by URL using [youtube-dl](https://github.com/ytdl-org/youtube-dl).

### Core Features

- **Media Streaming**: Stream audio and video files directly in the browser
- **Upload**: Upload media files to the server
- **Download**: Download media files from the server
- **Auto-Download (Cache by URL)**: Automatically fetch and cache media from a URL using youtube-dl
- **Media Library**: Browse and manage stored media

## Tech Stack

- **Frontend**: Angular (standalone components), TypeScript, RxJS, Angular Material
- **Backend**: NestJS
- **Monorepo**: Nx workspace
- **Build**: Nx CLI, Yarn
- **Styling**: SCSS with Angular Material theming
- **Media Fetching**: youtube-dl (server-side)

## Project Structure

```
harbor-play-media/
├── apps/
│   ├── web/              # Angular frontend application
│   ├── web-e2e/          # Playwright end-to-end tests for web
│   ├── api/              # NestJS backend
│   └── api-e2e/          # End-to-end tests for API
├── libs/
│   ├── shared-api/       # Common interfaces between API and web
│   └── ui/               # Shared UI component library (reusable Angular components)
├── nx.json               # Nx configuration
└── package.json
```

## Common Commands

```bash
yarn install              # Install dependencies
nx serve web              # Dev server for Angular app
nx build web              # Production build for Angular app
nx serve api              # Dev server for NestJS API
nx build api              # Production build for NestJS API
nx lint web               # Lint the web app
nx run-many -t build      # Build all projects
nx run-many -t lint       # Lint all projects
```

## Architecture

### Frontend (Angular)

The Angular frontend uses signal-based state management:

```typescript
// Signal state mutations
this.state.update((s) => ({ ...s, loading: false }));

// Component props using input()/output()
readonly media = input.required<MediaItem>();
readonly statusChanged = output<UploadStatus>();
```

### Backend (NestJS)

The NestJS backend provides REST APIs for:
- Media library CRUD operations
- File upload and download handling
- Media streaming (range request support)
- youtube-dl integration for URL-based auto-download
- Media metadata management

### Shared Interfaces (libs/shared-api)

Common TypeScript interfaces and types shared between the Angular frontend and NestJS backend. All API contracts (DTOs, request/response types) should be defined here.

## Code Style

- Prettier configured for formatting
- TypeScript strict mode enabled
- Angular: Standalone components only (no NgModules)
- Angular: Use `inject()` for dependency injection
- Angular: Use Signal Forms, not Reactive Forms or HTML forms
- Angular: Use separate files for HTML and SCSS
- NestJS: Follow standard module/controller/service pattern
- Naming convention: `.<file-type>` suffix (e.g., `media.model.ts`, `player.component.ts`, `streaming.service.ts`)
- Always use the frontend-design skill for creating/updating frontend UI
- Avoid using `null`, use `undefined` instead.

## Naming Conventions

### Models (Shared Interfaces)
Use the `Model` suffix for shared data interfaces. These must live in a shared library (e.g., `libs/shared-api`) so both the frontend and backend can consume them:
```typescript
// libs/shared-api/src/lib/video.model.ts
export interface VideoModel {
  id: string;
  title: string;
  url: string;
}

// libs/shared-api/src/lib/user.model.ts
export interface UserModel {
  id: string;
  username: string;
}
```

### Entities (NestJS)
Use the `Entity` suffix for NestJS database entities. Each entity must implement its corresponding shared `Model`:
```typescript
// apps/api/src/app/video/video.entity.ts
import { VideoModel } from '@harbor-play-media/shared-api';

@Entity()
export class VideoEntity implements VideoModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  url: string;
}
```

## TypeScript Standards

### Strict Mode Enforcement

1. **Never use `any`** - Use `unknown` when the type is truly unknown:
   ```typescript
   // ❌ Bad
   function parseData(data: any): void { }

   // ✅ Good
   function parseData(data: unknown): void {
     if (typeof data === 'string') {
       // Type narrowing
     }
   }
   ```

2. **Explicit Function/Method Typing** - All parameters and return types must be declared:
   ```typescript
   // ❌ Bad
   function getMediaUrl(id) {
     return `/api/media/${id}`;
   }

   // ✅ Good
   function getMediaUrl(id: string): string {
     return `/api/media/${id}`;
   }
   ```

3. **Explicit Variable Declarations** - Variables receiving values from functions/props must have explicit types:
   ```typescript
   // ❌ Bad
   const url = getMediaUrl('123');
   const { data } = response;

   // ✅ Good
   const url: string = getMediaUrl('123');
   const { data }: MediaResponse = response;
   ```

4. **Prefer Named Types** - Use explicit typings instead of inline object types:
   ```typescript
   // ❌ Bad
   function getMedia(id: string): { title: string } {
     return { title: 'My Video' };
   }

   // ✅ Good
   interface MediaResponse {
     title: string;
   }
   function getMedia(id: string): MediaResponse {
     return { title: 'My Video' };
   }
   ```

## Angular Component Architecture

### Component Size and Responsibility
- Keep components small and focused on a single responsibility
- Split large components into smaller, reusable pieces
- Aim for components under 200 lines of code

### Smart-Dumb Component Pattern

**Dumb Components (Presentational):**
- Handle UI rendering and UI-specific logic only
- Manage internal UI state via signals (e.g., dropdown open/closed)
- Handle UI events (click, change)
- **Not allowed**: Direct injection of data services, business logic, data fetching

**Smart Components (Container):**
- Inject services and manage data fetching
- Coordinate between multiple dumb components
- Handle business logic and state management

### Minimize Custom CSS
- Leverage Angular Material built-in components and theming
- Use component-scoped styles via `:host` and encapsulated SCSS
- Only create custom SCSS for:
  - Custom animations
  - Complex layouts not covered by Flexbox/Grid
  - Specific design requirements not covered by Angular Material

### UI Component Library (libs/ui)
- Create a dedicated `libs/ui` Nx library for all reusable Angular UI components
- Common elements (buttons, cards, media player controls, dialogs, etc.) should live here
- This keeps the design consistent across the app and avoids duplication
- Feature-specific components stay in their feature module; only truly reusable components belong in `libs/ui`

### Design
- The design should mainly be focused on dark theme
- The theme should be a blueish
- The design should be consistent across all pages
- Reuse components from `libs/ui` to keep the design consistent and maintainable
