# EasyDeal Backend - Vercel Deployment Guide

This guide will walk you through deploying the EasyDeal NestJS backend to Vercel.

## Prerequisites

- [Vercel account](https://vercel.com/signup)
- [Vercel CLI](https://vercel.com/cli) installed (optional, for CLI deployment)
- Firebase project with Admin SDK credentials

## Deployment Options

### Option 1: Deploy via Vercel Dashboard (Recommended for first deployment)

1. **Push your code to GitHub**

   ```bash
   git add .
   git commit -m "Add Vercel deployment configuration"
   git push origin main
   ```

2. **Import project in Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect it as a Node.js project

3. **Configure environment variables**
   - In the project settings, go to "Environment Variables"
   - Add the following variables (copy from your local `.env` file):
     - `FIREBASE_PROJECT_ID`
     - `FIREBASE_PRIVATE_KEY` (paste the entire private key including BEGIN/END markers)
     - `FIREBASE_CLIENT_EMAIL`
     - `NODE_ENV` = `production`
     - `FRONTEND_URL` = `https://your-frontend-domain.vercel.app` (your actual frontend URL)

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (usually 1-2 minutes)

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI** (if not already installed)

   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**

   ```bash
   vercel login
   ```

3. **Deploy**

   ```bash
   vercel
   ```

   - Follow the prompts
   - Link to existing project or create new one
   - Set environment variables when prompted

4. **Set environment variables** (if not done during deployment)

   ```bash
   vercel env add FIREBASE_PROJECT_ID
   vercel env add FIREBASE_PRIVATE_KEY
   vercel env add FIREBASE_CLIENT_EMAIL
   vercel env add NODE_ENV
   vercel env add FRONTEND_URL
   ```

5. **Deploy to production**
   ```bash
   vercel --prod
   ```

## Post-Deployment

### Access Your API

Once deployed, your API will be available at:

```
https://your-project-name.vercel.app
```

### Access Swagger Documentation

The Swagger UI will be accessible at:

```
https://your-project-name.vercel.app/api/docs
```

The Swagger documentation includes:

- Interactive API testing
- Full endpoint documentation
- Request/response examples
- Authentication configuration (Bearer JWT)

### Test Your Deployment

1. **Health Check**

   ```bash
   curl https://your-project-name.vercel.app
   ```

   Should return: `"Hello World!"`

2. **Swagger Docs**
   Visit `https://your-project-name.vercel.app/api/docs` in your browser

3. **Test Authentication**
   - Get a Firebase ID token from your frontend
   - Use Swagger UI to test the `/auth/verify` endpoint

## CORS Configuration

The backend is configured to accept requests from:

- The URL specified in `FRONTEND_URL` environment variable
- Or `*` (all origins) if `FRONTEND_URL` is not set

**Important**: In production, always set `FRONTEND_URL` to your actual frontend domain for security.

## Environment Variables Reference

| Variable                | Description                    | Example                            |
| ----------------------- | ------------------------------ | ---------------------------------- |
| `FIREBASE_PROJECT_ID`   | Firebase project ID            | `easydeal-f0091`                   |
| `FIREBASE_PRIVATE_KEY`  | Firebase Admin SDK private key | `-----BEGIN PRIVATE KEY-----\n...` |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email | `firebase-adminsdk-xxxxx@...`      |
| `NODE_ENV`              | Environment mode               | `production`                       |
| `FRONTEND_URL`          | Frontend URL for CORS          | `https://your-app.vercel.app`      |

## Troubleshooting

### Build Fails

- Check that all dependencies are in `dependencies` (not `devDependencies`)
- Ensure TypeScript compiles locally: `npm run build`

### 500 Internal Server Error

- Check Vercel function logs in the dashboard
- Verify all environment variables are set correctly
- Check that Firebase credentials are valid

### CORS Errors

- Ensure `FRONTEND_URL` is set to your frontend domain
- Check that frontend is sending requests to the correct backend URL
- Verify that requests include proper headers

### Swagger Not Loading

- Check that the route `/api/docs` is accessible
- Verify that Swagger dependencies are installed
- Check Vercel function logs for errors

## Updating Your Deployment

### Automatic Deployments (GitHub Integration)

Once linked to GitHub, Vercel will automatically deploy:

- **Production**: Every push to `main` branch
- **Preview**: Every pull request

### Manual Deployments

```bash
vercel --prod
```

## Vercel Configuration

The `vercel.json` file configures:

- Build source: `src/main.ts`
- Runtime: `@vercel/node`
- Routing: All requests to main.ts
- Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## Support

For issues specific to:

- **Vercel deployment**: Check [Vercel Support](https://vercel.com/support)
- **NestJS**: See [NestJS Discord](https://discord.gg/nestjs)
- **Firebase**: Visit [Firebase Support](https://firebase.google.com/support)
