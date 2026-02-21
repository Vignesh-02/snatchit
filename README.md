# Snatchit - Room Booking Platform

A full-stack room booking web application built with **Next.js 14** and **Appwrite**. Users can browse conference rooms, book them for specific time slots, and manage their listings — all with real-time conflict detection to prevent double-bookings.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [App Flow](#app-flow)
- [Pages](#pages)
- [Components](#components)
- [Server Actions](#server-actions)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)

---

## Overview

Snatchit is a marketplace-style platform for booking office meeting rooms. There are two types of users:

- **Bookers** — browse available rooms, book them for specific check-in/check-out times, and manage their bookings
- **Room Owners** — list their rooms with details (capacity, amenities, hourly price, image), and manage their listings

The app uses Appwrite as the backend-as-a-service for authentication, database, and file storage, and leverages Next.js Server Actions for all data mutations.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Frontend | React 18, JSX |
| Styling | Tailwind CSS 3 |
| Icons | React Icons |
| Notifications | React Toastify |
| Backend / Auth / DB | Appwrite (cloud) |
| Appwrite SDK | node-appwrite |
| Date/Time | Luxon |

---

## Features

- User registration and login via Appwrite Auth
- Browse all available rooms on the home page
- View room details (location, capacity, amenities, price per hour)
- Book a room with check-in and check-out date/time selection
- Real-time availability conflict detection — no double-bookings allowed
- Cancel bookings
- List and manage your own room listings
- Upload room images (stored in Appwrite Storage)
- Protected routes enforced via Next.js middleware
- Responsive UI for desktop and mobile

---

## Project Structure

```
snatchit/
├── src/
│   ├── app/
│   │   ├── layout.jsx              # Root layout — Header, Footer, ToastContainer, AuthWrapper
│   │   ├── page.jsx                # Home page — lists all rooms
│   │   ├── login/
│   │   │   └── page.jsx            # Login page
│   │   ├── register/
│   │   │   └── page.jsx            # Registration page
│   │   ├── bookings/
│   │   │   └── page.jsx            # User's bookings (protected)
│   │   ├── rooms/
│   │   │   ├── [id]/page.jsx       # Room detail + booking form
│   │   │   ├── add/page.jsx        # Create a new room listing (protected)
│   │   │   └── my/page.jsx         # User's room listings (protected)
│   │   └── actions/                # Next.js Server Actions (all backend logic)
│   │       ├── checkAuth.js
│   │       ├── createSession.js
│   │       ├── createUser.js
│   │       ├── destroySession.js
│   │       ├── getAllRooms.js
│   │       ├── getSingleRoom.js
│   │       ├── getMyRooms.js
│   │       ├── createRoom.js
│   │       ├── deleteRoom.js
│   │       ├── bookRoom.js
│   │       ├── getMyBookings.js
│   │       ├── cancelBooking.js
│   │       └── checkRoomAvailability.js
│   │
│   ├── components/
│   │   ├── Header.jsx              # Navigation bar
│   │   ├── Footer.jsx              # Footer
│   │   ├── AuthWrapper.jsx         # Wraps app with AuthContext provider
│   │   ├── Heading.jsx             # Reusable page title
│   │   ├── RoomCard.jsx            # Room card on home page
│   │   ├── BookingForm.jsx         # Booking form (check-in/out picker)
│   │   ├── BookedRoomCard.jsx      # Displays a user's booking
│   │   ├── MyRoomCard.jsx          # Displays a user's room listing
│   │   ├── CancelBookingButton.jsx # Cancel booking with confirmation
│   │   └── DeleteRoomButton.jsx    # Delete room with confirmation
│   │
│   ├── context/
│   │   └── authContext.js          # Global auth state via React Context
│   │
│   ├── config/
│   │   └── appwrite.js             # Appwrite client + admin client setup
│   │
│   └── assets/
│       └── styles/globals.css      # Global Tailwind CSS imports
│
├── middleware.js                   # Route protection for authenticated pages
├── next.config.mjs                 # Next.js config (Appwrite image domains)
├── tailwind.config.js
├── package.json
└── .env.local                      # Environment variables (not committed)
```

---

## App Flow

### Booker Flow

```
1. Visit /           → Browse all available rooms
2. Click "View Room" → /rooms/[id] — See room details
3. Fill booking form → Select check-in date/time and check-out date/time
4. Submit form       → Server checks for booking conflicts
   ├── Conflict found    → Show error toast, booking rejected
   └── No conflict       → Booking created, redirect to /bookings
5. Visit /bookings   → View all your bookings
6. Cancel a booking  → Confirmation prompt → Booking deleted
```

### Room Owner Flow

```
1. Login / Register
2. Visit /rooms/add  → Fill room details form + upload image
3. Submit form       → Room created → Appears on home page (/)
4. Visit /rooms/my   → View your room listings
5. Delete a room     → Confirmation prompt → Room deleted
```

### Authentication Flow

```
Register → createUser()    → Appwrite creates account
Login    → createSession() → Appwrite creates session
         → Session secret stored as HttpOnly cookie (appwrite-session)
         → setIsAuthenticated(true) in AuthContext

Protected route access:
middleware.js → checkAuth() → reads session cookie
  ├── Valid session    → Allow access
  └── Invalid session  → Redirect to /login

Logout → destroySession() → Appwrite deletes session
       → Cookie removed → setIsAuthenticated(false) → Redirect to /login
```

### Availability Conflict Detection

When a user submits a booking, `checkRoomAvailability()` is called:

1. Fetch all existing bookings for that room from Appwrite
2. Convert all check-in/check-out datetimes to UTC using Luxon
3. Check for overlap using the standard interval overlap formula:
   ```
   existing.check_in < new.check_out  AND  existing.check_out > new.check_in
   ```
4. If any overlap is found — reject the booking with an error message
5. If no overlap — create the booking document in Appwrite

---

## Pages

| Route | Access | Description |
|---|---|---|
| `/` | Public | Home — grid of all available rooms |
| `/login` | Public | Email and password login |
| `/register` | Public | New user registration |
| `/rooms/[id]` | Public | Room detail page with booking form |
| `/rooms/add` | Protected | Form to create a new room listing |
| `/rooms/my` | Protected | User's own room listings |
| `/bookings` | Protected | User's bookings with cancel option |

Protected routes redirect to `/login` if the user is not authenticated, enforced by `middleware.js`.

---

## Components

### Layout

| Component | Type | Description |
|---|---|---|
| `Header.jsx` | Client | Navigation bar. Shows auth-aware links — Login/Register for guests, Bookings/My Rooms/Logout for signed-in users |
| `Footer.jsx` | Server | Simple footer with copyright |
| `AuthWrapper.jsx` | Client | Wraps the app with `AuthProvider` so auth state is globally accessible via context |
| `Heading.jsx` | Server | Reusable styled page heading |

### Rooms

| Component | Type | Description |
|---|---|---|
| `RoomCard.jsx` | Server | Displays a room on the home page with image, name, location, capacity, price, and a "View Room" link |
| `BookingForm.jsx` | Client | Date/time pickers for check-in and check-out; submits to the `bookRoom()` server action |
| `MyRoomCard.jsx` | Server | Displays a room listing owned by the user with View and Delete options |
| `DeleteRoomButton.jsx` | Client | Handles room deletion with a confirmation dialog |

### Bookings

| Component | Type | Description |
|---|---|---|
| `BookedRoomCard.jsx` | Server | Displays a booking with room details, check-in/out times, and a cancel button |
| `CancelBookingButton.jsx` | Client | Handles booking cancellation with a confirmation dialog |

---

## Server Actions

All business logic lives in `src/app/actions/`. These are Next.js Server Actions (`'use server'`) — they run on the server and are called directly from React components, with no separate API layer needed.

### Auth

| File | Description |
|---|---|
| `checkAuth.js` | Reads the `appwrite-session` cookie and validates it with Appwrite |
| `createSession.js` | Logs in with email/password and stores the session secret as an HttpOnly cookie |
| `createUser.js` | Creates a new Appwrite user account |
| `destroySession.js` | Deletes the Appwrite session and removes the cookie |

### Rooms

| File | Description |
|---|---|
| `getAllRooms.js` | Fetches all rooms from Appwrite for the home page |
| `getSingleRoom.js` | Fetches one room by document ID |
| `getMyRooms.js` | Fetches rooms where `user_id` matches the logged-in user |
| `createRoom.js` | Uploads image to Appwrite Storage, then creates a room document |
| `deleteRoom.js` | Deletes a room document after verifying ownership |

### Bookings

| File | Description |
|---|---|
| `bookRoom.js` | Runs the availability check, then creates a booking document if no conflict exists |
| `getMyBookings.js` | Fetches bookings where `user_id` matches the logged-in user |
| `cancelBooking.js` | Deletes a booking document after verifying ownership |
| `checkRoomAvailability.js` | Fetches all bookings for a room and checks for datetime overlap using Luxon |

---

## Database Schema

The app uses **Appwrite** as its database. Two collections are used.

### Rooms Collection

| Field | Type | Description |
|---|---|---|
| `user_id` | string | ID of the room owner |
| `name` | string | Room name |
| `description` | string | Room description |
| `sqft` | number | Square footage |
| `capacity` | number | Max number of occupants |
| `location` | string | General location |
| `address` | string | Full address |
| `availability` | string | Operating hours (e.g. "9am - 6pm") |
| `price_per_hour` | number | Hourly booking rate |
| `amenities` | string | Comma-separated list of amenities |
| `image` | string | Appwrite Storage file ID for the room image |

### Bookings Collection

| Field | Type | Description |
|---|---|---|
| `user_id` | string | ID of the user who made the booking |
| `room_id` | object | Reference to the Room document |
| `check_in` | string | ISO 8601 datetime string |
| `check_out` | string | ISO 8601 datetime string |

### Storage

Room images are stored in an Appwrite Storage bucket. The image URL format used in the app is:

```
https://cloud.appwrite.io/v1/storage/buckets/{bucketId}/files/{fileId}/view?project={projectId}
```

---

## Authentication

- Authentication is handled entirely by **Appwrite**
- On login, Appwrite returns a session secret stored as an **HttpOnly, Secure, SameSite=Strict** cookie named `appwrite-session`
- Middleware reads this cookie on every request to protected routes
- Global auth state (`isAuthenticated`) is managed via React Context in `authContext.js`
- `middleware.js` protects `/bookings`, `/rooms/add`, and `/rooms/my`

**Security properties of the session cookie:**

```
httpOnly: true    → Not accessible by JavaScript (prevents XSS token theft)
secure: true      → Only sent over HTTPS
sameSite: strict  → Not sent on cross-site requests (prevents CSRF)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- An [Appwrite Cloud](https://cloud.appwrite.io) account (or self-hosted Appwrite instance)

### Appwrite Setup

1. Create a new Appwrite project
2. Create a database with two collections: `rooms` and `bookings` (see schema above)
3. Create a storage bucket for room images
4. Create an API key with appropriate read/write permissions
5. Enable Email/Password authentication in Appwrite Auth settings

### Install & Run

```bash
git clone https://github.com/your-username/snatchit.git
cd snatchit
npm install
```

Create a `.env.local` file (see below), then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Create a `.env.local` file in the root of the project:

```env
# Appwrite Admin Key (server-side only — never exposed to the browser)
NEXT_APPWRITE_KEY=your_appwrite_api_key

# Appwrite Public Config (bundled into client)
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE=your_database_id
NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS=rooms
NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS=bookings
NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS=rooms

# App base URL
NEXT_PUBLIC_URL=http://localhost:3000
```

| Variable | Scope | Description |
|---|---|---|
| `NEXT_APPWRITE_KEY` | Server only | Appwrite API key with admin permissions |
| `NEXT_PUBLIC_APPWRITE_ENDPOINT` | Public | Appwrite API endpoint URL |
| `NEXT_PUBLIC_APPWRITE_PROJECT` | Public | Appwrite project ID |
| `NEXT_PUBLIC_APPWRITE_DATABASE` | Public | Appwrite database ID |
| `NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS` | Public | Rooms collection ID |
| `NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS` | Public | Bookings collection ID |
| `NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS` | Public | Storage bucket ID for room images |
| `NEXT_PUBLIC_URL` | Public | Base URL of the app |
