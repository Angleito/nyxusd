# Email Subscription Setup with Vercel KV

## Overview
The email subscription system uses Vercel KV Storage to persist email subscriptions for whitepaper downloads and updates.

## Setup Instructions

### 1. Enable Vercel KV Storage
1. Go to your Vercel dashboard
2. Navigate to your project
3. Click on "Storage" tab
4. Click "Create Database" → Select "KV"
5. Name it (e.g., "nyxusd-subscriptions")
6. Select your preferred region
7. Click "Create"

### 2. Environment Variables
After creating the KV database, Vercel will automatically add these environment variables:
- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

These are automatically available in your Vercel deployment.

### 3. Local Development
For local development, you need to:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Copy the KV environment variables
3. Create a `.env.local` file in the `/api` directory:
```env
KV_URL=your_kv_url
KV_REST_API_URL=your_kv_rest_api_url
KV_REST_API_TOKEN=your_kv_rest_api_token
```

### 4. API Endpoints

#### POST /api/subscriptions
Create a new email subscription.

Request body:
```json
{
  "email": "user@example.com",
  "source": "whitepaper-page",
  "metadata": {
    "campaign": "hackathon"
  }
}
```

#### GET /api/subscriptions?email=user@example.com
Check if an email is subscribed.

#### DELETE /api/subscriptions?email=user@example.com
Unsubscribe an email.

#### GET /api/subscriptions/count
Get total subscription count (admin endpoint).

### 5. Rate Limiting
- Maximum 5 subscriptions per IP address per hour
- Returns 429 status code when limit exceeded

### 6. Data Structure
Subscriptions are stored with the key pattern `subscription:{email}`:
```typescript
{
  email: string;
  subscribedAt: Date;
  source: string;
  ipAddress?: string;
  metadata?: {
    userAgent?: string;
    referrer?: string;
    campaign?: string;
  };
}
```

### 7. Testing
Run the test script:
```bash
node api/test-subscriptions.mjs
```

Note: For local testing, start the Vercel dev server first:
```bash
vercel dev
```

## Security Considerations
- Email validation with max 254 characters
- Rate limiting per IP address
- Input sanitization (lowercase, trim)
- CORS headers configured for production domain

## Monitoring
Monitor subscriptions through:
1. Vercel KV dashboard for storage metrics
2. `/api/subscriptions/count` endpoint for subscription count
3. Vercel Functions logs for errors