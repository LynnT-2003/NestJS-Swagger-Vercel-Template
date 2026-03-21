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

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `8080` |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | `http://localhost:3000,http://localhost:3001` |
| `MONGO_CLUSTER_URI` | Atlas cluster URI (everything after `@` in connection string) | — |
| `MONGO_DB_NAME` | Database name inside your cluster | — |
| `MONGO_USERNAME` | Database user username | — |
| `MONGO_PASSWORD` | Database user password | — |

## Deployment

Configured for Vercel via `vercel.json`. Push to your connected repo and Vercel handles the rest. Make sure to set all env vars in your Vercel project settings.
