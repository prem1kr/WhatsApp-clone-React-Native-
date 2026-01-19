
# WhatsApp Clone

A full-stack WhatsApp-like messaging application with real-time chat, group conversations, and media support, built using **React Native (Expo)** for the frontend and **Node.js/Express** with **Socket.IO** for the backend.


## Features

- User Authentication (Login/Register)
- Real-time messaging with **Socket.IO**
- Direct Messages and Group Conversations
- Create and manage group chats with custom avatars
- View conversation history and last messages
- Upload media and group avatars using Cloudinary
- Profile management
- Responsive UI for mobile devices

---

## Tech Stack

**Frontend:**

- React Native (Expo)
- TypeScript
- Axios (HTTP requests)
- Socket.IO-client (real-time updates)
- Expo Image Picker (avatar upload)
- Tailwind-inspired styling constants

**Backend:**

- Node.js + Express
- MongoDB (Atlas)
- Socket.IO (real-time communication)

**Other Utilities:**

- AsyncStorage (local storage)
- Reanimated & LinearGradient for UI effects
- Phosphor-react-native icons

---

## Installation

### Backend

1. Navigate to the backend folder:

```bash
cd backend
````

2. Install dependencies:

```bash
npm install
```

3. Setup `.env` file with your MongoDB URI, JWT secret, and Socket.IO settings.

4. Start the server:

```bash
npm run dev
```

---

### Frontend

1. Navigate to the frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the Expo development server:

```bash
npx expo start
```

* You can run the app on a simulator, Expo Go app, or web.

---

## Environment Variables

Create a `.env` file in the backend with variables like:

```env
MONGO_URI=<Your MongoDB Atlas URI>
JWT_SECRET=<Your JWT secret key>
CLOUDINARY_NAME=<Cloudinary cloud name>
CLOUDINARY_KEY=<Cloudinary API key>
CLOUDINARY_SECRET=<Cloudinary API secret>
```

Frontend `.env` (optional) can include:

```env
API_URL=http://localhost:5000
CLOUDINARY_UPLOAD_PRESET=group_avatars
```

---

## Folder Overview

**Frontend (`frontend/app`)**

```
(auth)
├─ login.tsx
├─ register.tsx
├─ welcome.tsx
(main)
├─ conversation.tsx
├─ home.tsx
├─ newConversationModel.tsx
├─ profileModel.tsx
├─ _layout.tsx
├─ index.tsx
components
├─ Avatar.tsx
├─ BackButton.tsx
├─ Button.tsx
├─ ConversationItem.tsx
├─ Header.tsx
├─ Input.tsx
├─ Loading.tsx
├─ MessageItem.tsx
├─ ScreenWrapper.tsx
├─ Typo.tsx
constants
├─ index.ts
├─ theme.ts
context
├─ userContext.tsx
services
├─ imageService.ts
socket
├─ socket.ts
├─ socketEvents.ts
utils
├─ socket.ts
├─ styling.ts
```

**Backend (`backend`)**

```
controllers
config
model
routes
socket
├─ chatEvent.js
├─ socket.js
├─ userEvents.js
utils
server.js
type.js
```

---

## Future Improvements

* Implement push notifications
* Add message read receipts
* Improve media support (videos, documents)
* Add user status (online/offline)
* Search conversations and contacts
* Pagination for large contact lists

---

