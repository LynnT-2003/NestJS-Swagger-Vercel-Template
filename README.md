# NestJS API Template

NestJS + Mongoose + Swagger API template, deployable to Vercel.

## Prerequisites

- Node.js >= 18
- A MongoDB Atlas account (free tier works) — or a local MongoDB instance

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create your environment file

```bash
cp .env.example .env
```

### 3. Set up MongoDB Atlas (step by step)

If you already have a MongoDB URI, skip to step 3.5.

#### 3.1 Create an Atlas account

Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and sign up (free).

#### 3.2 Create a Cluster

A **cluster** is the server that hosts your databases. Think of it as the machine your data lives on.

1. Click **"Build a Database"**
2. Pick **M0 Free** tier
3. Choose a cloud provider & region (pick one close to you)
4. Give it a name (e.g. `my-cluster`) and click **Create Deployment**

#### 3.3 Create a Database User

This is the username/password your app uses to authenticate with MongoDB — it is NOT your Atlas login.

1. In the Atlas sidebar, go to **Database Access**
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Set a username and password (no special characters in the password to avoid URI encoding issues)
5. Under **Database User Privileges**, select **Read and write to any database**
6. Click **Add User**

These values go into your `.env`:

```
MONGO_USERNAME=the_username_you_just_created
MONGO_PASSWORD=the_password_you_just_created
```

#### 3.4 Get your Cluster URI

1. Go to **Database** in the sidebar and click **Connect** on your cluster
2. Choose **Drivers**
3. You'll see a connection string like:

```
mongodb+srv://<username>:<password>@my-cluster.abc123.mongodb.net/?retryWrites=true&w=majority&appName=my-cluster
```

4. Copy everything **after** `<password>@` — that's your cluster URI:

```
my-cluster.abc123.mongodb.net/?retryWrites=true&w=majority&appName=my-cluster
```

This goes into your `.env`:

```
MONGO_CLUSTER_URI=my-cluster.abc123.mongodb.net/?retryWrites=true&w=majority&appName=my-cluster
```

> **How it works under the hood:** `buildMongoUri()` in `src/configs/mongo-uri-builder.ts` takes your cluster URI and database name and constructs the full `mongodb+srv://username:password@cluster/dbName?params` string. You don't build the URI yourself.

#### 3.5 Choose a Database Name

A **database** is a container inside your cluster. One cluster can have multiple databases (e.g. one for dev, one for staging).

A **collection** is like a table in SQL — it lives inside a database and holds your documents (records). Collections are created automatically when you first insert data via a Mongoose model/schema, so you don't need to create them manually.

```
Cluster (server)
└── Database (e.g. "myapp-dev")
    ├── Collection: users        ← created automatically from your User schema
    ├── Collection: products     ← created automatically from your Product schema
    └── Collection: orders       ← created automatically from your Order schema
```

Pick a name for your database and add it to `.env`:

```
MONGO_DB_NAME=myapp-dev
```

#### 3.6 Allow network access

1. In Atlas sidebar, go to **Network Access**
2. Click **Add IP Address**
3. For development: click **Allow Access from Anywhere** (`0.0.0.0/0`)
4. For production: add your server's specific IP

### 4. Your final `.env` should look like

```
APP_ENVIRONMENT=Development

PORT=8080
BASE_URL=http://localhost:8080
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

RATE_LIMIT_TIMEFRAME_SECONDS=60
RATE_LIMIT_MAX_REQUESTS=10

MONGO_USERNAME=myuser
MONGO_PASSWORD=mypassword123
MONGO_CLUSTER_URI=my-cluster.abc123.mongodb.net/?retryWrites=true&w=majority&appName=my-cluster
MONGO_DB_NAME=myapp-dev

AUTH_TOKEN_SECRET=
AUTH_REFRESH_TOKEN_SECRET=
GOOGLE_CLIENT_ID=
RESET_PASSWORD_SECRET=
```

## Running

```bash
# development (watch mode)
npm run start:dev

# production
npm run build
npm run start:prod
```

### What you should see on successful startup

```
[Nest] LOG   🚀 Application is running on: http://localhost:8080
[Nest] LOG   📚 Swagger documentation: http://localhost:8080/api/docs
[Nest] LOG   MongoDB connected: myapp-dev (host: my-cluster.abc123.mongodb.net)
[Nest] WARN  No collections found in this database yet.
```

Collections appear automatically once you define Mongoose schemas and insert data.

### What you'll see if MongoDB fails

```
[Nest] ERROR MongoDB connection error: querySrv ENOTFOUND _mongodb._tcp.bad-cluster.mongodb.net
```

Common causes:

- **Wrong `MONGO_CLUSTER_URI`** — double check the value from Atlas Connect dialog
- **Wrong credentials** — verify `MONGO_USERNAME` / `MONGO_PASSWORD` match your Database User (not your Atlas login)
- **Network not allowed** — add your IP in Atlas > Network Access
- **Empty env vars** — make sure `.env` values are filled in, not blank

## Project Structure

```
src/
├── configs/
│   ├── api-docs.config.ts      # Swagger/OpenAPI setup (buildAPIDocs)
│   ├── db-connection-names.ts  # Named DB connection constants
│   ├── env.config.ts           # Centralized env loader (loadEnvConfigs)
│   ├── mongo-uri-builder.ts    # Builds full MongoDB URI from cluster + db name
│   └── types/
│       └── env.ts              # TypeScript types for all env configs
├── app.module.ts               # Root module — ConfigModule + MongooseModule + DB logging
├── app.controller.ts           # Health check endpoint
├── app.service.ts
└── main.ts                     # Bootstrap — CORS, trust proxy, Swagger, listen
```

## Environment Variables

See `.env.example` for the full list. Key variables:

| Variable            | Description                                                   | Default                                       |
| ------------------- | ------------------------------------------------------------- | --------------------------------------------- |
| `PORT`              | Server port                                                   | `8080`                                        |
| `ALLOWED_ORIGINS`   | Comma-separated CORS origins                                  | `http://localhost:3000,http://localhost:3001` |
| `MONGO_CLUSTER_URI` | Atlas cluster URI (everything after `@` in connection string) | —                                             |
| `MONGO_DB_NAME`     | Database name inside your cluster                             | —                                             |
| `MONGO_USERNAME`    | Database user username                                        | —                                             |
| `MONGO_PASSWORD`    | Database user password                                        | —                                             |

## Deployment

Configured for Vercel via `vercel.json`. Push to your connected repo and Vercel handles the rest. Make sure to set all env vars in your Vercel project settings.

# NestJS Auth Boilerplate

Production-ready authentication boilerplate built on NestJS, MongoDB, and Passport.js. Designed as a reusable foundation for client projects — drop in, configure environment variables, ship.

---

## Table of Contents

- [Stack](#stack)
- [System Architecture](#system-architecture)
- [Module Structure](#module-structure)
- [Data Flow](#data-flow)
- [Sequence Diagrams](#sequence-diagrams)
  - [Local Registration](#1-local-registration)
  - [Local Login](#2-local-login)
  - [Google OAuth](#3-google-oauth-flow)
  - [Authenticated Request](#4-authenticated-request-jwt-guard)
  - [Token Refresh](#5-token-refresh)
  - [Logout](#6-logout)
- [Data Models](#data-models)
- [API Reference](#api-reference)
- [Security Model](#security-model)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Project Structure](#project-structure)

---

## Stack

| Layer          | Technology                                   |
| -------------- | -------------------------------------------- |
| Framework      | NestJS 10+                                   |
| Language       | TypeScript 5+                                |
| Database       | MongoDB via Mongoose                         |
| Authentication | Passport.js (local + google-oauth20 + jwt)   |
| Token Strategy | JWT access token (15m) + refresh token (30d) |
| Validation     | class-validator + class-transformer          |
| Deployment     | Vercel (serverless)                          |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT                                  │
│              (Web App / Mobile App / Postman)                    │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        VERCEL EDGE                               │
│                    (vercel.json routing)                         │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NESTJS APPLICATION                          │
│                                                                  │
│  ┌─────────────┐   ┌──────────────┐   ┌─────────────────────┐  │
│  │  Global     │   │   Global     │   │   Global            │  │
│  │  Validation │──▶│   JwtGuard   │──▶│   RolesGuard        │  │
│  │  Pipe       │   │   (APP_GUARD)│   │   (APP_GUARD)       │  │
│  └─────────────┘   └──────────────┘   └─────────────────────┘  │
│                            │                                     │
│              ┌─────────────┴──────────────┐                     │
│              ▼                            ▼                     │
│  ┌───────────────────┐      ┌───────────────────────┐           │
│  │   AuthModule      │      │     UserModule        │           │
│  │                   │      │                       │           │
│  │  AuthController   │      │  UserController       │           │
│  │  AuthService      │─────▶│  UserService          │           │
│  │  LocalStrategy    │      │  UserEntity           │           │
│  │  GoogleStrategy   │      └───────────┬───────────┘           │
│  │  JwtStrategy      │                  │                       │
│  └───────────────────┘                  │                       │
│                                         ▼                       │
│                          ┌──────────────────────────┐           │
│                          │        MongoDB            │           │
│                          │   (users collection)      │           │
│                          └──────────────────────────┘           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  common/                                                  │   │
│  │  enums · interfaces · decorators · guards · filters       │   │
│  │  interceptors · pipes · strategies                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Module Structure

```
src/
├── main.ts                          Entry point
├── app.module.ts                    Root module — global guards, DI wiring
│
├── common/                          Shared across all modules
│   ├── enums/
│   │   ├── user-role.enum.ts        USER | ADMIN
│   │   └── oauth-provider.enum.ts   GOOGLE | LOCAL
│   ├── interfaces/
│   │   ├── user.interface.ts        IUser, IUserPublic, ICurrentUser
│   │   └── auth.interface.ts        IJwtPayload, IAuthTokens, IAuthResponse
│   ├── decorators/
│   │   ├── current-user.decorator.ts  @CurrentUser()
│   │   ├── public.decorator.ts        @Public()
│   │   └── roles.decorator.ts         @Roles()
│   ├── guards/
│   │   ├── jwt.guard.ts             Global — protects all routes
│   │   └── roles.guard.ts           Global — enforces @Roles()
│   ├── strategies/
│   │   └── jwt.strategy.ts          Validates Bearer token on every request
│   ├── filters/
│   │   └── http-exception.filter.ts  Consistent error response shape
│   ├── interceptors/
│   │   └── transform.interceptor.ts  Wraps all responses in { success, data }
│   └── pipes/
│       └── validation.pipe.ts        Global DTO validation
│
└── modules/
    ├── auth/
    │   ├── interfaces/
    │   │   └── auth.service.interface.ts   IAuthService contract
    │   ├── dto/
    │   │   ├── register.dto.ts
    │   │   ├── login.dto.ts
    │   │   └── refresh-token.dto.ts
    │   ├── strategies/
    │   │   ├── local.strategy.ts    email + password
    │   │   └── google.strategy.ts   OAuth2
    │   ├── guards/
    │   │   ├── local.guard.ts
    │   │   ├── google.guard.ts
    │   │   └── google-callback.guard.ts
    │   ├── auth.service.ts
    │   ├── auth.controller.ts
    │   └── auth.module.ts
    │
    └── user/
        ├── interfaces/
        │   └── user.service.interface.ts   IUserService contract
        ├── entity/
        │   └── user.entity.ts       Mongoose schema + subdocuments
        ├── dto/
        │   ├── update-user.dto.ts
        │   └── oauth-user.dto.ts    Internal — passport → service
        ├── user.service.ts
        ├── user.controller.ts
        └── user.module.ts
```

---

## Data Flow

```
                    ┌──────────────────────────────────────────┐
                    │              Request Lifecycle            │
                    └──────────────────────────────────────────┘

HTTP Request
     │
     ▼
┌─────────────────┐
│ ValidationPipe  │  Strips unknown fields, validates DTO shape
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   JwtGuard      │  Checks @Public() metadata
│   (global)      │  If not public → verifies Bearer token
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  JwtStrategy    │  Decodes payload → findById() → attaches ICurrentUser
│  .validate()    │  to req.user
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   RolesGuard    │  Checks @Roles() metadata against req.user.role
│   (global)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Controller    │  Reads @CurrentUser(), @Body(), @Param()
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Service      │  Business logic, DB calls, token generation
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  TransformInt.  │  Wraps response: { success, statusCode, data, timestamp }
└────────┬────────┘
         │
         ▼
     HTTP Response

     On error:
┌─────────────────┐
│ HttpException   │  { success: false, statusCode, message, path, timestamp }
│    Filter       │
└─────────────────┘
```

---

## Sequence Diagrams

### 1. Local Registration

```
Client          AuthController      AuthService         UserService        MongoDB
  │                   │                  │                   │                │
  │ POST /auth/register│                  │                   │                │
  │ { email, password, │                  │                   │                │
  │   displayName }    │                  │                   │                │
  │──────────────────▶│                  │                   │                │
  │                   │ register(dto)     │                   │                │
  │                   │─────────────────▶│                   │                │
  │                   │                  │ findByEmail()      │                │
  │                   │                  │──────────────────▶│                │
  │                   │                  │                   │ findOne(email)  │
  │                   │                  │                   │───────────────▶│
  │                   │                  │                   │◀───────────────│
  │                   │                  │◀──────────────────│ null           │
  │                   │                  │                   │                │
  │                   │                  │ bcrypt.hash(pw)   │                │
  │                   │                  │──────┐            │                │
  │                   │                  │◀─────┘            │                │
  │                   │                  │                   │                │
  │                   │                  │ createLocalUser() │                │
  │                   │                  │──────────────────▶│                │
  │                   │                  │                   │ save(user)     │
  │                   │                  │                   │───────────────▶│
  │                   │                  │                   │◀───────────────│
  │                   │                  │◀──────────────────│ UserDocument   │
  │                   │                  │                   │                │
  │                   │                  │ generateTokens()  │                │
  │                   │                  │──────┐            │                │
  │                   │                  │◀─────┘            │                │
  │                   │                  │                   │                │
  │                   │                  │ saveRefreshToken()│                │
  │                   │                  │──────────────────▶│                │
  │                   │                  │                   │ $push token    │
  │                   │                  │                   │───────────────▶│
  │                   │◀─────────────────│                   │                │
  │                   │ { user, tokens } │                   │                │
  │◀──────────────────│                  │                   │                │
  │ 201 { success,    │                  │                   │                │
  │   data: {         │                  │                   │                │
  │     user: IUserPublic,               │                   │                │
  │     tokens: {     │                  │                   │                │
  │       accessToken,│                  │                   │                │
  │       refreshToken│                  │                   │                │
  │     }}}           │                  │                   │                │
```

### 2. Local Login

```
Client          LocalGuard       LocalStrategy      AuthService       UserService
  │                 │                 │                  │                 │
  │ POST /auth/login│                 │                  │                 │
  │ { email, pw }   │                 │                  │                 │
  │────────────────▶│                 │                  │                 │
  │                 │ canActivate()   │                  │                 │
  │                 │────────────────▶│                  │                 │
  │                 │                 │ validate(email,pw)│                │
  │                 │                 │─────────────────▶│                 │
  │                 │                 │                  │ findByEmail()   │
  │                 │                 │                  │ (+password)     │
  │                 │                 │                  │────────────────▶│
  │                 │                 │                  │◀────────────────│
  │                 │                 │                  │ UserDocument    │
  │                 │                 │                  │                 │
  │                 │                 │                  │ bcrypt.compare()│
  │                 │                 │                  │─────┐           │
  │                 │                 │                  │◀────┘           │
  │                 │                 │◀─────────────────│ UserDocument    │
  │                 │ req.user = doc  │                  │                 │
  │                 │◀────────────────│                  │                 │
  │                 │                 │                  │                 │
  │           AuthController          │                  │                 │
  │                 │ login(req.user) │                  │                 │
  │                 │─────────────────────────────────▶ │                 │
  │                 │                 │                  │ generateTokens()│
  │                 │                 │                  │─────┐           │
  │                 │                 │                  │◀────┘           │
  │◀────────────────────────────────────────────────────│                 │
  │ 200 { user, tokens }              │                  │                 │
```

### 3. Google OAuth Flow

```
Client           AuthController    GoogleStrategy      UserService      AuthService
  │                   │                 │                   │                │
  │ GET /auth/google  │                 │                   │                │
  │──────────────────▶│                 │                   │                │
  │                   │ GoogleGuard     │                   │                │
  │◀──────────────────│ 302 redirect    │                   │                │
  │                   │ → Google OAuth  │                   │                │
  │                   │                 │                   │                │
  │  [User approves Google consent]     │                   │                │
  │                   │                 │                   │                │
  │ GET /auth/google/callback?code=...  │                   │                │
  │──────────────────▶│                 │                   │                │
  │                   │ GoogleCallback  │                   │                │
  │                   │ Guard           │                   │                │
  │                   │────────────────▶│                   │                │
  │                   │                 │ validate(profile) │                │
  │                   │                 │ build OAuthUserDto│                │
  │                   │                 │──────────────────▶│                │
  │                   │                 │                   │ findOrCreate   │
  │                   │                 │                   │ OAuthUser()    │
  │                   │                 │                   │────┐           │
  │                   │                 │                   │◀───┘           │
  │                   │                 │◀──────────────────│ UserDocument   │
  │                   │                 │                   │                │
  │                   │                 │ oauthLogin(user)  │                │
  │                   │                 │──────────────────────────────────▶│
  │                   │                 │                   │  generateTokens│
  │                   │                 │◀──────────────────────────────────│
  │                   │                 │ IAuthResponse     │                │
  │                   │ req.user =      │                   │                │
  │                   │ IAuthResponse   │                   │                │
  │◀──────────────────│                 │                   │                │
  │ 200 { user, tokens}                 │                   │                │
```

### 4. Authenticated Request (JWT Guard)

```
Client            JwtGuard         JwtStrategy          UserService
  │                  │                  │                    │
  │ GET /users/me    │                  │                    │
  │ Authorization:   │                  │                    │
  │ Bearer <token>   │                  │                    │
  │─────────────────▶│                  │                    │
  │                  │ canActivate()    │                    │
  │                  │ check @Public()  │                    │
  │                  │ → not public     │                    │
  │                  │─────────────────▶│                    │
  │                  │                  │ verify signature   │
  │                  │                  │ check expiry       │
  │                  │                  │ decode payload     │
  │                  │                  │                    │
  │                  │                  │ validate(payload)  │
  │                  │                  │ findById(sub)      │
  │                  │                  │───────────────────▶│
  │                  │                  │◀───────────────────│
  │                  │                  │ UserDocument       │
  │                  │                  │                    │
  │                  │ req.user =       │                    │
  │                  │ ICurrentUser     │                    │
  │                  │◀─────────────────│                    │
  │                  │                  │                    │
  │            UserController           │                    │
  │                  │ getMe()          │                    │
  │                  │ @CurrentUser()   │                    │
  │                  │ → req.user       │                    │
  │◀─────────────────│                  │                    │
  │ 200 { IUserPublic}                  │                    │
```

### 5. Token Refresh

```
Client          AuthController      AuthService          UserService
  │                   │                  │                    │
  │ POST /auth/refresh│                  │                    │
  │ { userId,         │                  │                    │
  │   refreshToken }  │                  │                    │
  │──────────────────▶│                  │                    │
  │                   │ refreshTokens()  │                    │
  │                   │─────────────────▶│                    │
  │                   │                  │ findValidRefresh   │
  │                   │                  │ Token(userId, tok) │
  │                   │                  │───────────────────▶│
  │                   │                  │                    │ findById
  │                   │                  │                    │ +refreshTokens
  │                   │                  │                    │ bcrypt.compare
  │                   │                  │◀───────────────────│
  │                   │                  │ UserDocument | null│
  │                   │                  │                    │
  │                   │                  │ [if null → 401]    │
  │                   │                  │                    │
  │                   │                  │ removeRefreshToken │
  │                   │                  │ (old stored hash)  │
  │                   │                  │───────────────────▶│
  │                   │                  │                    │ $pull token
  │                   │                  │                    │
  │                   │                  │ generateTokens()   │
  │                   │                  │ (new pair)         │
  │                   │                  │───────────────────▶│
  │                   │                  │                    │ $push new hash
  │                   │◀─────────────────│                    │
  │◀──────────────────│ { accessToken,   │                    │
  │ 200 new tokens    │   refreshToken } │                    │
```

### 6. Logout

```
Client          AuthController      AuthService          UserService
  │                   │                  │                    │
  │ POST /auth/logout │                  │                    │
  │ Authorization:    │                  │                    │
  │ Bearer <token>    │                  │                    │
  │ { userId,         │                  │                    │
  │   refreshToken }  │                  │                    │
  │──────────────────▶│                  │                    │
  │                   │ [JwtGuard runs]  │                    │
  │                   │ logout()         │                    │
  │                   │─────────────────▶│                    │
  │                   │                  │ findValidRefresh   │
  │                   │                  │ Token()            │
  │                   │                  │───────────────────▶│
  │                   │                  │◀───────────────────│
  │                   │                  │                    │
  │                   │                  │ [if null → return] │
  │                   │                  │                    │
  │                   │                  │ iterate tokens     │
  │                   │                  │ bcrypt.compare()   │
  │                   │                  │ removeRefreshToken │
  │                   │                  │ (matching hash)    │
  │                   │                  │───────────────────▶│
  │                   │                  │                    │ $pull token
  │                   │◀─────────────────│                    │
  │◀──────────────────│ 200 void         │                    │
```

---

## Data Models

### User Document

```
users collection
┌─────────────────────────────────────────────────────────┐
│ Field             Type              Notes                │
├─────────────────────────────────────────────────────────┤
│ _id               ObjectId          Auto-generated       │
│ email             string | null     unique, sparse       │
│ password          string | null     bcrypt, select:false │
│ displayName       string            required             │
│ avatar            string | null                          │
│ role              UserRole          default: USER        │
│ isEmailVerified   boolean           default: false       │
│ providers         OAuthProvider[]   subdocument array    │
│ refreshTokens     RefreshToken[]    bcrypt, select:false │
│ createdAt         Date              auto (timestamps)    │
│ updatedAt         Date              auto (timestamps)    │
└─────────────────────────────────────────────────────────┘

OAuthProvider subdocument (_id: false)
┌─────────────────────────────────────────────────────────┐
│ provider          OAuthProviderType  'google' | 'local' │
│ providerId        string             unique per provider │
│ accessToken       string | null                         │
└─────────────────────────────────────────────────────────┘

RefreshToken subdocument (_id: false)
┌─────────────────────────────────────────────────────────┐
│ token             string             bcrypt hash        │
│ createdAt         Date                                  │
│ expiresAt         Date               30 days from issue │
└─────────────────────────────────────────────────────────┘
```

### MongoDB Indexes

```
{ email: 1 }                              unique, sparse
{ providers.provider: 1,
  providers.providerId: 1 }               compound — OAuth lookup
```

---

## API Reference

All responses are wrapped by `TransformInterceptor`:

```json
// Success
{
  "success": true,
  "statusCode": 200,
  "data": { ... },
  "timestamp": "2026-01-01T00:00:00.000Z"
}

// Error
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid email or password",
  "path": "/api/auth/login",
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

### Auth Endpoints

| Method | Path                        | Guard                        | Body              | Description      |
| ------ | --------------------------- | ---------------------------- | ----------------- | ---------------- |
| POST   | `/api/auth/register`        | Public                       | `RegisterDto`     | Create account   |
| POST   | `/api/auth/login`           | Public + LocalGuard          | `LoginDto`        | Local login      |
| POST   | `/api/auth/refresh`         | Public                       | `RefreshTokenDto` | Rotate tokens    |
| POST   | `/api/auth/logout`          | JwtGuard                     | `RefreshTokenDto` | Invalidate token |
| GET    | `/api/auth/google`          | Public + GoogleGuard         | —                 | Initiate OAuth   |
| GET    | `/api/auth/google/callback` | Public + GoogleCallbackGuard | —                 | OAuth callback   |

### User Endpoints

| Method | Path               | Guard            | Body            | Description      |
| ------ | ------------------ | ---------------- | --------------- | ---------------- |
| GET    | `/api/users/me`    | JwtGuard         | —               | Get own profile  |
| PATCH  | `/api/users/me`    | JwtGuard         | `UpdateUserDto` | Update profile   |
| DELETE | `/api/users/me`    | JwtGuard         | —               | Delete account   |
| GET    | `/api/users/admin` | JwtGuard + ADMIN | —               | Admin only route |

---

## Security Model

```
┌────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                           │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  1. TRANSPORT        HTTPS enforced via Vercel edge            │
│                                                                │
│  2. INPUT            class-validator — whitelist, strip        │
│                      forbidNonWhitelisted on all DTOs          │
│                                                                │
│  3. AUTHENTICATION   JWT access token — 15 min expiry          │
│                      Signed with dedicated ACCESS_SECRET       │
│                                                                │
│  4. REFRESH          Refresh token — 30 day expiry             │
│                      Stored as bcrypt hash in MongoDB          │
│                      Rotated on every use (invalidate + new)   │
│                      Expired tokens pruned on save             │
│                                                                │
│  5. PASSWORDS        bcrypt — 10 salt rounds                   │
│                      select: false — never returned in queries │
│                                                                │
│  6. AUTHORIZATION    Role-based via @Roles() + RolesGuard      │
│                      Checked after JWT validation              │
│                                                                │
│  7. DATA             password + refreshTokens select:false     │
│                      IUserPublic strips sensitive fields       │
│                      OAuthProvider exposes name only, not token│
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Environment Variables

```bash
# Application
PORT=3000

# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/<db>

# JWT
JWT_ACCESS_SECRET=your-access-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
```

---

## Installation

```bash
# Install dependencies
npm install

# Install auth packages
npm install @nestjs/passport @nestjs/jwt passport passport-local passport-google-oauth20 passport-jwt bcrypt class-validator class-transformer mongoose @nestjs/mongoose ms

# Install type definitions
npm install -D @types/passport-local @types/passport-google-oauth20 @types/passport-jwt @types/bcrypt

# Copy environment file
cp .env.example .env

# Run development
npm run start:dev

# Run production
npm run build && npm run start:prod
```

---

## Project Structure

```
src/
├── main.ts
├── app.module.ts
├── common/
│   ├── enums/
│   │   ├── user-role.enum.ts
│   │   ├── oauth-provider.enum.ts
│   │   └── index.ts
│   ├── interfaces/
│   │   ├── user.interface.ts
│   │   ├── auth.interface.ts
│   │   └── index.ts
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   ├── public.decorator.ts
│   │   └── roles.decorator.ts
│   ├── guards/
│   │   ├── jwt.guard.ts
│   │   └── roles.guard.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── interceptors/
│   │   └── transform.interceptor.ts
│   └── pipes/
│       └── validation.pipe.ts
└── modules/
    ├── auth/
    │   ├── interfaces/auth.service.interface.ts
    │   ├── dto/
    │   │   ├── register.dto.ts
    │   │   ├── login.dto.ts
    │   │   ├── refresh-token.dto.ts
    │   │   └── index.ts
    │   ├── strategies/
    │   │   ├── local.strategy.ts
    │   │   └── google.strategy.ts
    │   ├── guards/
    │   │   ├── local.guard.ts
    │   │   ├── google.guard.ts
    │   │   └── google-callback.guard.ts
    │   ├── auth.service.ts
    │   ├── auth.controller.ts
    │   └── auth.module.ts
    └── user/
        ├── interfaces/user.service.interface.ts
        ├── entity/user.entity.ts
        ├── dto/
        │   ├── update-user.dto.ts
        │   ├── oauth-user.dto.ts
        │   └── index.ts
        ├── user.service.ts
        ├── user.controller.ts
        └── user.module.ts
```

---

_Built as a reusable boilerplate. Add providers by creating a new strategy file and registering it in `AuthModule` — the rest of the architecture requires no changes._

---

## How JWT and Bearer Token Work

A common point of confusion — `@CurrentUser()` looks like magic but it is entirely driven by the Bearer token in the request header.

```
Every protected request must include:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Full chain:
─────────────────────────────────────────────────────────────────

1. Client sends request with Authorization: Bearer <accessToken>

2. JwtGuard (registered globally via APP_GUARD) intercepts every request
   → Checks if route is marked @Public() — if yes, skips entirely
   → If not public, hands off to JwtStrategy

3. JwtStrategy (passport-jwt) automatically:
   → Extracts the token from the Authorization header
   → Verifies the signature using JWT_ACCESS_SECRET
   → Checks the expiry (exp claim)
   → Decodes the payload: { sub, email, role }

4. JwtStrategy.validate(payload) runs:
   → Calls userService.findById(payload.sub)
   → Confirms user still exists in DB
   → Returns ICurrentUser: { userId, email, role }

5. Passport attaches the return value to req.user

6. @CurrentUser() decorator simply reads req.user
   → No token handling, no decoding — that is already done

─────────────────────────────────────────────────────────────────

So this controller method:

  @Get('me')
  getMe(@CurrentUser() user: ICurrentUser) {
    ...
  }

Is equivalent to:

  @Get('me')
  getMe(@Req() req: Request) {
    const user = req.user as ICurrentUser; // set by JwtStrategy
    ...
  }

@CurrentUser() is purely a readability shortcut.
```

**What happens if no token is sent:**

```
→ JwtGuard detects missing/invalid token
→ Returns 401 Unauthorized before the controller ever runs
→ @CurrentUser() is never called
```

**What happens if token is expired:**

```
→ passport-jwt checks exp claim
→ Returns 401 Unauthorized automatically
→ Client must call POST /api/auth/refresh to get new tokens
```

---

## Google OAuth Setup

Yes — Google Cloud Console at [console.cloud.google.com](https://console.cloud.google.com).

### Step 1 — Create a project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click the project dropdown at the top → **New Project**
3. Give it a name (e.g. `my-app-auth`) → **Create**

### Step 2 — Enable the Google+ API

1. In the left sidebar → **APIs & Services** → **Library**
2. Search for **Google People API** → **Enable**
   > Note: The older "Google+ API" is deprecated. Use **Google People API** — passport-google-oauth20 works with it.

### Step 3 — Configure OAuth consent screen

1. **APIs & Services** → **OAuth consent screen**
2. Choose **External** (for any Google account) or **Internal** (G Suite only)
3. Fill in:
   - App name
   - User support email
   - Developer contact email
4. Click **Save and Continue**
5. On **Scopes** → Add:
   - `userinfo.email`
   - `userinfo.profile`
6. Click **Save and Continue** through the rest

### Step 4 — Create OAuth credentials

1. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**
2. Application type: **Web application**
3. Name it (e.g. `nestjs-auth`)
4. Under **Authorized redirect URIs** add:

   ```
   # Local development
   http://localhost:3000/api/auth/google/callback

   # Production
   https://yourdomain.com/api/auth/google/callback
   ```

   > This must exactly match `GOOGLE_CALLBACK_URL` in your `.env`

5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

### Step 5 — Add to .env

```bash
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret-here
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

### OAuth flow overview

```
User clicks "Login with Google"
         │
         ▼
GET /api/auth/google
  → GoogleGuard redirects to:
    https://accounts.google.com/o/oauth2/auth
    ?client_id=YOUR_CLIENT_ID
    &redirect_uri=YOUR_CALLBACK_URL
    &scope=email profile
         │
         ▼
User approves Google consent screen
         │
         ▼
Google redirects to:
GET /api/auth/google/callback?code=AUTHORIZATION_CODE
         │
         ▼
GoogleCallbackGuard → GoogleStrategy.validate()
  → Exchanges code for access token with Google
  → Fetches user profile from Google
  → Calls findOrCreateOAuthUser()
  → Calls oauthLogin()
  → Returns { user, tokens } to client
```

### Common errors

| Error                   | Cause                                               | Fix                                                |
| ----------------------- | --------------------------------------------------- | -------------------------------------------------- |
| `redirect_uri_mismatch` | Callback URL in `.env` doesn't match Google Console | Ensure exact match including protocol and path     |
| `invalid_client`        | Wrong Client ID or Secret                           | Double check `.env` values                         |
| `Access blocked`        | OAuth consent screen not configured                 | Complete Step 3 above                              |
| `403 access_denied`     | App in testing mode, user not added                 | Add test user in OAuth consent screen → Test users |

> **Testing mode:** While your app is in testing mode on Google Console, only users explicitly added under **OAuth consent screen → Test users** can log in. Publish the app to allow any Google account.

---

## Swagger Bearer Auth Setup

To add the lock icon to protected routes in Swagger, two changes are needed.

### 1. Update `api-docs.config.ts`

```typescript
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function buildAPIDocs(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Your API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addBearerAuth(
      // ← add this
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'access-token', // ← this is the reference name used in @ApiBearerAuth()
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
}
```

### 2. Add `@ApiBearerAuth()` to protected controllers

```typescript
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('access-token')   // ← matches the name in addBearerAuth()
@Controller('users')
export class UserController { ... }
```

```typescript
@ApiBearerAuth('access-token')
@Controller('auth')
export class AuthController { ... }
```

> Public routes (`@Public()`) will still show the lock icon but will work without a token — Swagger doesn't know about your `@Public()` decorator, only NestJS does.

### How to use in Swagger UI

1. Open `http://localhost:3000/api/docs`
2. Click **Authorize** button (top right)
3. Paste your `accessToken` from a login response
4. Click **Authorize** → **Close**
5. All routes with the lock icon now send `Authorization: Bearer <token>` automatically
