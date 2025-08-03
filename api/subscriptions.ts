import { VercelRequest, VercelResponse } from '@vercel/node';

interface EmailSubscription {
  readonly email: string;
  readonly subscribedAt: string;
  readonly source: string;
  readonly ipAddress?: string;
}

interface SubscriptionRequest {
  readonly email: string;
  readonly source?: string;
}

interface SubscriptionResponse {
  readonly success: boolean;
  readonly message?: string;
  readonly error?: string;
}

// For Vercel deployment, we'll use environment variables to store data
// In production, this should integrate with Vercel KV or external database
const subscriptions = new Map<string, EmailSubscription>();

/**
 * Validates email format using a strict regex pattern
 */
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Sanitizes email by converting to lowercase and trimming whitespace
 */
const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

/**
 * Vercel serverless function for whitepaper email subscriptions
 * POST /api/subscriptions - Subscribe to whitepaper updates
 * GET /api/subscriptions - Get subscription count
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Enable CORS for frontend
  res.setHeader('Access-Control-Allow-Origin', process.env['FRONTEND_URL'] || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'POST') {
      // Handle subscription creation
      const { email, source = 'whitepaper-page' }: SubscriptionRequest = req.body;

      // Validate required fields
      if (!email) {
        const response: SubscriptionResponse = {
          success: false,
          error: 'Email is required'
        };
        res.status(400).json(response);
        return;
      }

      // Sanitize email
      const sanitizedEmail = sanitizeEmail(email);

      // Validate email format
      if (!validateEmail(sanitizedEmail)) {
        const response: SubscriptionResponse = {
          success: false,
          error: 'Invalid email format'
        };
        res.status(400).json(response);
        return;
      }

      // Check if already subscribed
      if (subscriptions.has(sanitizedEmail)) {
        const response: SubscriptionResponse = {
          success: true,
          message: 'Email is already subscribed to updates'
        };
        res.status(200).json(response);
        return;
      }

      // Create subscription record
      const subscription: EmailSubscription = {
        email: sanitizedEmail,
        subscribedAt: new Date().toISOString(),
        source,
        ipAddress: req.headers['x-forwarded-for'] as string || req.connection?.remoteAddress
      };

      // Store subscription
      subscriptions.set(sanitizedEmail, subscription);

      // Log subscription (Vercel will capture this)
      console.log('New whitepaper subscription:', {
        email: sanitizedEmail,
        source,
        timestamp: subscription.subscribedAt,
        ipAddress: subscription.ipAddress
      });

      const response: SubscriptionResponse = {
        success: true,
        message: 'Successfully subscribed to whitepaper updates'
      };

      res.status(201).json(response);

    } else if (req.method === 'GET') {
      // Handle subscription count request
      const count = subscriptions.size;
      
      res.status(200).json({
        success: true,
        count,
        timestamp: new Date().toISOString()
      });

    } else {
      // Method not allowed
      res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }

  } catch (error) {
    console.error('Error processing subscription request:', error);
    
    const response: SubscriptionResponse = {
      success: false,
      error: 'Internal server error'
    };
    
    res.status(500).json(response);
  }
}