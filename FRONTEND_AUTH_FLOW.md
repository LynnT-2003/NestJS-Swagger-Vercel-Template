# Frontend Authentication Flow

## How It Works

The authentication flow involves **both frontend and backend** working together:

### Step-by-Step Flow:

```
┌─────────────┐                    ┌──────────────┐                    ┌─────────────┐
│  Frontend   │                    │   Firebase   │                    │   Backend   │
│   (React/   │                    │   Auth SDK   │                    │  (NestJS)   │
│  Vue/etc)   │                    │              │                    │             │
└──────┬──────┘                    └──────┬───────┘                    └──────┬──────┘
       │                                   │                                  │
       │  1. User clicks "Sign In"         │                                  │
       │──────────────────────────────────>│                                  │
       │                                   │                                  │
       │  2. User signs in (Email/Google) │                                  │
       │<──────────────────────────────────│                                  │
       │                                   │                                  │
       │  3. Firebase returns ID Token     │                                  │
       │<──────────────────────────────────│                                  │
       │                                   │                                  │
       │  4. Send token to backend         │                                  │
       │─────────────────────────────────────────────────────────────────────>│
       │                                   │                                  │
       │                                   │  5. Verify token                │
       │                                   │  6. Create/Update user in DB    │
       │                                   │                                  │
       │  7. Backend returns user data    │                                  │
       │<─────────────────────────────────────────────────────────────────────│
       │                                   │                                  │
       │  8. Store token for future requests                                │
       │                                   │                                  │
```

## Detailed Flow:

### 1. **Frontend: User Signs In**

The frontend uses Firebase Client SDK to authenticate:

```javascript
// For Email/Password
import { signInWithEmailAndPassword } from 'firebase/auth';

const userCredential = await signInWithEmailAndPassword(auth, email, password);
const token = await userCredential.user.getIdToken();

// OR for Google Sign-In
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const provider = new GoogleAuthProvider();
const result = await signInWithPopup(auth, provider);
const token = await result.user.getIdToken();
```

**Firebase handles:**

- ✅ Email/Password validation
- ✅ Google OAuth flow
- ✅ Facebook OAuth flow
- ✅ Token generation
- ✅ User session management

### 2. **Frontend: Send Token to Backend**

After getting the token, frontend calls your backend:

```javascript
const response = await fetch('http://localhost:3000/auth/verify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    token: token, // Firebase ID token
    username: 'john_doe', // Optional: custom username
  }),
});

const data = await response.json();
// { success: true, user: { uid, username, email, ... } }
```

### 3. **Backend: Verify Token & Create User**

Your backend (`POST /auth/verify`):

1. ✅ Verifies the Firebase ID token
2. ✅ Gets user info from Firebase Auth
3. ✅ Creates/updates user in Firestore
4. ✅ Returns user data

### 4. **Frontend: Store Token for Protected Routes**

```javascript
// Store token in localStorage or state
localStorage.setItem('firebaseToken', token);

// Use token for protected API calls
const response = await fetch('http://localhost:3000/auth/me', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

---

## 🔧 API Service Setup

First, create an API service file to handle all backend calls:

```javascript
// api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Verify Firebase token and create/update user
  async verifyToken(token, username = null) {
    return this.request('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ token, username }),
    });
  }

  // Get current authenticated user
  async getCurrentUser(token) {
    return this.request('/auth/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Get user by UID
  async getUserById(uid, token) {
    return this.request(`/auth/user/${uid}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

export const api = new ApiService();
```

---

## 💻 Complete Implementation Examples

### Example 1: Email/Password Sign Up & Sign In

```javascript
// auth.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from './firebase'; // Your Firebase config file
import { api } from './api'; // The API service file above

// Sign Up (Create Account)
export async function signUp(email, password, username) {
  try {
    // 1. Create account in Firebase
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const token = await userCredential.user.getIdToken();

    // 2. Send token to backend to create user in Firestore
    const result = await api.verifyToken(token, username);

    // 3. Store token
    localStorage.setItem('firebaseToken', token);

    return {
      success: true,
      user: result.user,
      token,
    };
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
}

// Sign In (Existing User)
export async function signIn(email, password) {
  try {
    // 1. Sign in with Firebase
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const token = await userCredential.user.getIdToken();

    // 2. Send token to backend (creates/updates user in Firestore)
    const result = await api.verifyToken(token);

    // 3. Store token
    localStorage.setItem('firebaseToken', token);

    return {
      success: true,
      user: result.user,
      token,
    };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}
```

### Example 2: Google Sign In

```javascript
// auth.js
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from './firebase';
import { api } from './api';

export async function signInWithGoogle() {
  try {
    // 1. Sign in with Google via Firebase
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const token = await result.user.getIdToken();

    // 2. Send token to backend (creates/updates user in Firestore)
    const result = await api.verifyToken(token);

    // 3. Store token
    localStorage.setItem('firebaseToken', token);

    return {
      success: true,
      user: result.user,
      token,
    };
  } catch (error) {
    console.error('Google sign in error:', error);
    throw error;
  }
}
```

### Example 3: Get Current User

```javascript
// auth.js
import { api } from './api';

export async function getCurrentUser() {
  try {
    const token = localStorage.getItem('firebaseToken');

    if (!token) {
      throw new Error('No token found. Please sign in.');
    }

    const result = await api.getCurrentUser(token);

    if (!result.success) {
      throw new Error(result.message || 'Failed to get user');
    }

    return result.user;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
}
```

### Example 4: React Component Example

```javascript
// SignInForm.jsx
import { useState } from 'react';
import { signIn, signInWithGoogle } from './auth';

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn(email, password);
      console.log('Signed in:', result.user);
      // Redirect to dashboard or update app state
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await signInWithGoogle();
      console.log('Signed in with Google:', result.user);
      // Redirect to dashboard or update app state
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleEmailSignIn}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
      <button type="button" onClick={handleGoogleSignIn} disabled={loading}>
        Sign in with Google
      </button>
    </form>
  );
}
```

---

## 🔒 Protected API Calls

For any protected route, include the token in the Authorization header:

```javascript
// Make authenticated API call
const token = localStorage.getItem('firebaseToken');

const response = await fetch('http://localhost:3000/auth/me', {
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

const data = await response.json();
```

---

## ⚠️ Error Handling

### Common Errors:

1. **401 Unauthorized** - Invalid or expired token

   ```javascript
   // Solution: Get a new token
   const user = auth.currentUser;
   const newToken = await user.getIdToken();
   ```

2. **User not found** - User doesn't exist in Firestore

   ```javascript
   // Solution: Call /auth/verify first to create user
   await api.verifyToken(token);
   ```

3. **Username already exists** - Username is taken
   ```javascript
   // Solution: Use a different username or let backend generate one
   await api.verifyToken(token); // Without username
   ```

### Error Handling Example:

```javascript
async function handleApiCall(apiFunction) {
  try {
    const result = await apiFunction();
    return { success: true, data: result };
  } catch (error) {
    if (error.response?.status === 401) {
      // Token expired, refresh it
      const user = auth.currentUser;
      if (user) {
        const newToken = await user.getIdToken();
        localStorage.setItem('firebaseToken', newToken);
        // Retry the call
        return handleApiCall(apiFunction);
      }
    }
    return { success: false, error: error.message };
  }
}
```

---

## 📦 Token Management

### Store Token:

```javascript
localStorage.setItem('firebaseToken', token);
```

### Get Token:

```javascript
const token = localStorage.getItem('firebaseToken');
```

### Refresh Token (Firebase auto-refreshes, but you can force it):

```javascript
const user = auth.currentUser;
if (user) {
  const freshToken = await user.getIdToken(true); // Force refresh
  localStorage.setItem('firebaseToken', freshToken);
}
```

### Check if User is Authenticated:

```javascript
import { onAuthStateChanged } from 'firebase/auth';

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    user.getIdToken().then((token) => {
      localStorage.setItem('firebaseToken', token);
    });
  } else {
    // User is signed out
    localStorage.removeItem('firebaseToken');
  }
});
```

---

## 🎯 Complete Flow Summary

### Sign Up Flow:

1. User fills sign-up form (email, password, username)
2. Frontend calls `createUserWithEmailAndPassword()` → Firebase creates account
3. Frontend gets Firebase ID token
4. Frontend calls `POST /auth/verify` with token → Backend creates user in Firestore
5. Store token in localStorage
6. Redirect to dashboard

### Sign In Flow:

1. User fills sign-in form (email, password) OR clicks "Sign in with Google"
2. Frontend calls `signInWithEmailAndPassword()` or `signInWithPopup()` → Firebase authenticates
3. Frontend gets Firebase ID token
4. Frontend calls `POST /auth/verify` with token → Backend creates/updates user in Firestore
5. Store token in localStorage
6. Redirect to dashboard

### Protected Route Flow:

1. Get token from localStorage
2. Include token in `Authorization: Bearer <token>` header
3. Backend verifies token
4. Backend returns protected data

---

## 📚 API Reference

### `POST /auth/verify`

**Purpose:** Verify Firebase token and create/update user in Firestore

**Request:**

```json
{
  "token": "firebase-id-token",
  "username": "john_doe" // Optional
}
```

**Response (Success):**

```json
{
  "success": true,
  "user": {
    "uid": "abc123xyz",
    "username": "john_doe",
    "email": "john@example.com",
    "displayName": "John Doe",
    "photoURL": "https://example.com/photo.jpg"
  }
}
```

**Response (Error):**

```json
{
  "statusCode": 401,
  "message": "Invalid or expired token"
}
```

---

### `GET /auth/me`

**Purpose:** Get current authenticated user

**Headers:**

```
Authorization: Bearer <firebase-token>
```

**Response (Success):**

```json
{
  "success": true,
  "user": {
    "uid": "abc123xyz",
    "username": "john_doe",
    "email": "john@example.com",
    "displayName": "John Doe",
    "photoURL": "https://example.com/photo.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response (Error):**

```json
{
  "statusCode": 401,
  "message": "Invalid token"
}
```

---

### `GET /auth/user/:uid`

**Purpose:** Get user by UID

**Headers:**

```
Authorization: Bearer <firebase-token>
```

**Response (Success):**

```json
{
  "success": true,
  "user": {
    "uid": "abc123xyz",
    "username": "john_doe",
    "email": "john@example.com",
    "displayName": "John Doe",
    "photoURL": "https://example.com/photo.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response (Error):**

```json
{
  "success": false,
  "message": "User not found"
}
```

---

## ✅ Checklist for Frontend Developer

- [ ] Install Firebase SDK (`npm install firebase`)
- [ ] Initialize Firebase with your config
- [ ] Create API service file with base URL
- [ ] Implement sign-up function (Email/Password)
- [ ] Implement sign-in function (Email/Password)
- [ ] Implement Google sign-in function
- [ ] Implement token storage (localStorage)
- [ ] Implement protected API calls with Authorization header
- [ ] Add error handling for 401 errors
- [ ] Add token refresh logic
- [ ] Test all endpoints with Swagger UI at `http://localhost:3000/api/docs`

---

## 🆘 Need Help?

- **Swagger Documentation:** `http://localhost:3000/api/docs`
- **Firebase Docs:** https://firebase.google.com/docs/auth
- **Backend Base URL:** `http://localhost:3000` (change for production)

---

## 📝 Summary

**Frontend Responsibilities:**

- ✅ Handle user sign-up/sign-in UI
- ✅ Call Firebase Auth SDK to authenticate
- ✅ Get Firebase ID token
- ✅ Send token to backend `/auth/verify`
- ✅ Store token for future requests
- ✅ Include token in Authorization header for protected routes

**Backend Responsibilities:**

- ✅ Verify Firebase ID tokens
- ✅ Create/update users in Firestore
- ✅ Return user data
- ✅ Protect routes with authentication

**Key Points:**

1. **Firebase handles authentication** - Email/Password, Google, Facebook
2. **Backend verifies tokens** - Ensures they're valid
3. **Backend stores user data** - In Firestore for your app
4. **Frontend sends token** - For every protected API call
