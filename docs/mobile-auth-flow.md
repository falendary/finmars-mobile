# Mobile Auth Flow (Keycloak)

This document explains how authentication works in the Ionic + Vue + Capacitor mobile app using **Keycloak**.

The goal of the architecture is:

* user logs in once
* session is restored automatically on next launches
* authentication logic is centralized and predictable

---

# Key Principle

## `/login` is the single auth gateway

All authentication flows pass through **`/login`**.

It is responsible for:

* restoring sessions
* handling Keycloak callbacks
* starting login when needed
* routing user after authentication

This prevents redirect loops and keeps the flow simple.

---

# Main Components

## 1. `login.vue`

**Auth bootstrap page**

Responsibilities:

* starts auth flow when entering `/login`
* calls `bootstrapSession()`
* redirects user after authentication

Does **not** interact directly with Keycloak.

Delegates to `authService.js`.

---

## 2. `authService.js`

**Authentication flow controller**

Decides what should happen next.

Main tasks:

* detect Keycloak callback params
* check if tokens exist locally
* attempt session restore
* start login if needed
* route user after authentication

Key functions:

```
bootstrapSession()
tryRestoreSession()
startLoginFlow()
routeAfterAuth(router)
cleanupAuthCallbackUrl()
```

Think of this layer as **auth policy logic**.

---

## 3. `keycloakService.js`

**Keycloak integration layer**

Wraps the `keycloak-js` adapter and manages the singleton instance.

Responsibilities:

* create Keycloak instance
* initialize Keycloak
* login/logout
* token refresh
* token persistence
* attach Keycloak event handlers

Key functions:

```
initKeycloak()
loginKeycloak()
refreshToken()
logoutKeycloak()
clearTokens()
```

This is the **only place where Keycloak is used directly**.

---

## 4. `App.vue`

**Application shell**

Responsibilities:

* passcode lock
* connectivity monitoring
* global loading state
* app foreground/background handling
* theme initialization

`App.vue` **must not contain auth routing logic**.

---

# Authentication Flow

## First login

```
/welcome
  → user selects region
  → /login
  → bootstrapSession()

  no local session
  → loginKeycloak()
  → redirect to Keycloak

  user logs in
  → redirect back to /login

  initKeycloak()
  → tokens saved
  → routeAfterAuth()

  → /workspaces OR /main/dashboard
```

---

## Returning user

```
/login
  → bootstrapSession()

  local tokens exist
  → tryRestoreSession()
  → initKeycloak()

  session restored
  → routeAfterAuth()
```

User enters the app without seeing login again.

---

# Why `/login` is the callback route

Keycloak redirects back to:

```
/login
```

This page already knows how to:

* detect callback parameters
* initialize Keycloak
* route user correctly

Redirecting to `/welcome` would break the flow because that page does not process authentication.

---

# Token Storage

Currently stored in:

```
Preferences (kcTokens)
```

Other stored items:

```
region
username
activeSpaceCode
activeSpaceName
```

### Future improvement

Tokens should move to **secure native storage**:

* iOS Keychain
* Android Keystore

---

# Redirect URI Strategy

Keycloak login and init both use:

```
redirectUri = /login
```

Example (dev):

```
http://localhost:8100/m/login
```

Example (production):

```
https://app-domain/.../login
```

---

# Developer Rules

### 1. Do not add auth logic to `App.vue`

Authentication flow belongs in:

```
login.vue
authService.js
keycloakService.js
```

---

### 2. Do not redirect Keycloak to `/welcome`

Always use:

```
/login
```

---

### 3. Only `keycloakService.js` may create the Keycloak instance

Never create `new Keycloak()` anywhere else.

---

### 4. Keep responsibilities separated

| Layer                | Responsibility       |
| -------------------- | -------------------- |
| UI                   | `login.vue`          |
| Flow logic           | `authService.js`     |
| Keycloak integration | `keycloakService.js` |
| App shell            | `App.vue`            |

---

# Mental Model

Think of the system as **three layers**:

```
login.vue
      ↓
authService.js
      ↓
keycloakService.js
      ↓
Keycloak
```

Each layer has a single responsibility.

---

# Common Issues

### User logs in but returns to welcome screen

Cause:

```
redirectUri points to /welcome
```

Fix:

```
redirectUri must be /login
```

---

### Login loop after redirect

Cause:

```
callback parameters not processed
```

Fix:
Ensure `/login` calls `bootstrapSession()`.

---

### Session not restored on restart

Cause:

```
initKeycloak() failed or tokens missing
```

---

# Summary

Authentication works through a **single gateway page**:

```
/login
```

The flow is controlled by:

```
login.vue → authService.js → keycloakService.js
```

This design keeps the system predictable and avoids redirect chaos.
