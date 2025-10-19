# Deployment Instructions

## Frontend (Vercel) Configuration

To connect your Vercel-hosted frontend to your Pxxl-hosted backend, you need to set the following environment variable in your Vercel project:

### Environment Variable
- **Name**: `REACT_APP_API_URL`
- **Value**: `https://hannaai.pxxl.click`

### How to set it in Vercel:
1. Go to your Vercel dashboard
2. Select your HannaAI project
3. Go to Settings → Environment Variables
4. Add a new variable:
   - Name: `REACT_APP_API_URL`
   - Value: `https://hannaai.pxxl.click`
   - Environment: Production (and Preview if needed)
5. Redeploy your application

## Backend (Pxxl) Configuration

The backend is already configured to accept requests from Vercel domains. If you need to add additional domains, set the `ALLOW_ORIGIN` environment variable in Pxxl:

### Environment Variable (Optional)
- **Name**: `ALLOW_ORIGIN`
- **Value**: Comma-separated list of allowed origins (e.g., `https://hannaai.vercel.app,https://your-custom-domain.com`)

## Testing the Connection

After setting up the environment variables:

1. Deploy both frontend and backend
2. Open your Vercel frontend URL
3. Open browser DevTools → Console
4. Try to use the chat feature
5. Check the console for the API_BASE and REACT_APP_API_URL values
6. Look for any CORS or network errors

## Troubleshooting

### Common Issues:
1. **"Network error: Failed to fetch"** - Check that REACT_APP_API_URL is set correctly
2. **CORS errors** - Verify your backend URL is accessible and CORS is configured
3. **404 errors** - Ensure your backend is deployed and the URL is correct

### Debug Steps:
1. Check browser console for API_BASE value
2. Test backend URL directly in browser (should show health check)
3. Verify environment variables are set in Vercel
4. Check Pxxl logs for any server errors
