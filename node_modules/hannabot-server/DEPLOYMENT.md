# Deployment Guide for pxxl.app

## Prerequisites

1. **OpenAI API Key**: You need a valid OpenAI API key
2. **pxxl.app Account**: Sign up at pxxl.app
3. **pxxl CLI**: Install the pxxl CLI tool

## Deployment Steps

### 1. Prepare Environment Variables

In your pxxl.app dashboard, set these environment variables:

```
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=production
PORT=4000
ALLOW_ORIGIN=*
```

### 2. Deploy via pxxl CLI

```bash
# Install pxxl CLI (if not already installed)
npm install -g pxxl-cli

# Login to pxxl.app
pxxl login

# Deploy your application
pxxl deploy

# Check deployment status
pxxl deployments

# View logs
pxxl logs
```

### 3. Alternative: GitHub Integration

1. Push your code to GitHub
2. Connect your GitHub repository to pxxl.app
3. Set environment variables in the pxxl.app dashboard
4. Deploy from the dashboard

## Configuration Files

The following files have been created for pxxl.app deployment:

- `pxxl.config.js` - pxxl.app specific configuration
- `vercel.json` - Alternative deployment configuration
- `.pxxlignore` - Files to ignore during deployment

## Troubleshooting

### Common Issues:

1. **Environment Variables Not Set**
   - Ensure `OPENAI_API_KEY` is set in pxxl.app dashboard
   - Check that all required environment variables are configured

2. **Port Binding Issues**
   - The server is configured to bind to `0.0.0.0:4000`
   - pxxl.app will automatically assign the port

3. **CORS Issues**
   - The server includes enhanced CORS configuration
   - Update `ALLOW_ORIGIN` if needed for your frontend domain

4. **Build Failures**
   - Check that all dependencies are listed in `package.json`
   - Ensure Node.js version compatibility (requires Node 18+)

### Debugging Commands:

```bash
# Check deployment status
pxxl deployments

# View real-time logs
pxxl logs --follow

# Refresh deployment
pxxl refresh

# Check application health
curl https://your-app.pxxl.app/health
```

## Health Check

The application includes a health check endpoint at `/health` that returns:
```json
{
  "ok": true
}
```

## API Endpoints

- `POST /api/chat` - Main chat endpoint
- `GET /health` - Health check endpoint

## Support

If you continue to experience deployment issues:

1. Check the pxxl.app documentation
2. Review deployment logs in the pxxl.app dashboard
3. Ensure all environment variables are correctly set
4. Verify your OpenAI API key is valid and has sufficient credits
