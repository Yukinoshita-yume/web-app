# Eventitude Web App

A Vue 3 frontend application for the Eventitude event management system, built using the design style from login-page project.

## Features

- 🔐 User Authentication (Login/Register)
- 📅 Event Management (Create, View, Edit, Delete)
- 🔍 Event Search with filters
- 📝 Question & Discussion System
- 👤 User Profile Management
- 📱 Responsive Design

## Tech Stack

- Vue 3 + Composition API
- Vue Router 4
- Axios
- Vite

## Project Structure

```
src/
├── api/           # API configuration
├── assets/        # Static resources
├── components/    # Vue components
├── router/        # Route configuration
├── utils/         # Utility functions
└── App.vue       # Root component
```

## Components

- **Login.vue** - Login page
- **Register.vue** - Registration page
- **Home.vue** - Event list homepage
- **EventDetail.vue** - Event details page
- **CreateEvent.vue** - Create event page
- **UserProfile.vue** - User profile center
- **ConfirmDialog.vue** - Confirmation dialog component

## API Endpoints

### User Authentication
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /users` - User registration

### Event Management
- `POST /events` - Create event
- `GET /event/:event_id` - Get event details
- `PATCH /event/:event_id` - Update event
- `DELETE /event/:event_id` - Delete event
- `POST /event/:event_id` - Register for event
- `GET /search` - Search events

### Question Management
- `POST /event/:event_id/question` - Create question
- `DELETE /question/:question_id` - Delete question
- `POST /question/:question_id/vote` - Upvote question
- `DELETE /question/:question_id/vote` - Downvote question

## Design Style

Adopts the design style from login-page project:
- Purple gradient background
- Rounded card design
- Hover effects
- Responsive layout

## Development

1. Ensure backend service is running on `http://localhost:3333`
2. Run `npm run dev` to start development server
3. Visit `http://localhost:5173` to view the application

## Notes

- All authenticated operations check for token
- Unauthenticated users are redirected to login page
- Event creators can edit and delete their own events
- Only registered users can ask questions in events
- Uses Unix timestamps for date/time fields
- API expects `first_name` and `last_name` for user registration
- Event data structure follows the API specification


