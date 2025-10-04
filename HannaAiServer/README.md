# HannaAiServer

A Node.js Express server for the HannaAI chatbot application.

## Features

- OpenAI GPT-4 integration
- Chat interface with multiple modes (Beginner, Intermediate, Advanced)
- Code review and improvement assistance
- Quiz generation
- CORS support
- Health check endpoint

## Prerequisites

- Node.js 18 or higher
- OpenAI API key

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `env.example`:
   ```bash
   cp env.example .env
   ```

4. Add your OpenAI API key to the `.env` file:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## Docker Deployment

### Using Docker Compose
```bash
docker-compose up -d
```

### Using Docker directly
```bash
docker build -t hannaai-server .
docker run -p 4000:4000 --env-file .env hannaai-server
```

## Environment Variables

- `OPENAI_API_KEY` (required): Your OpenAI API key
- `PORT` (optional): Server port (default: 4000)
- `NODE_ENV` (optional): Environment (development/production)
- `ALLOW_ORIGIN` (optional): CORS origin (default: "*")
- `HOST` (optional): Server host (default: "0.0.0.0")

## API Endpoints

- `POST /api/chat` - Chat endpoint
- `GET /health` - Health check endpoint

## Deployment Platforms

This server can be deployed on:
- Heroku
- Railway
- Render
- DigitalOcean App Platform
- AWS Elastic Beanstalk
- Google Cloud Run
- Azure Container Instances

Make sure to set the `OPENAI_API_KEY` environment variable in your deployment platform.
