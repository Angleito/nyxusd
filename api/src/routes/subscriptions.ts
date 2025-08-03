import express from 'express';
import { logger } from '../utils/logger';

const router = express.Router();

interface EmailSubscription {
  readonly email: string;
  readonly subscribedAt: Date;
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

// In-memory storage for demo purposes
// In production, this should use a proper database
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
 * POST /api/subscriptions/whitepaper
 * Subscribe to whitepaper updates
 */
router.post('/whitepaper', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
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
      subscribedAt: new Date(),
      source,
      ipAddress: req.ip || req.connection.remoteAddress
    };

    // Store subscription
    subscriptions.set(sanitizedEmail, subscription);

    logger.info('New whitepaper subscription', {
      email: sanitizedEmail,
      source,
      ipAddress: subscription.ipAddress
    });

    const response: SubscriptionResponse = {
      success: true,
      message: 'Successfully subscribed to whitepaper updates'
    };

    res.status(201).json(response);

  } catch (error) {
    logger.error('Error processing whitepaper subscription', error);
    
    const response: SubscriptionResponse = {
      success: false,
      error: 'Internal server error'
    };
    
    res.status(500).json(response);
  }
});

/**
 * GET /api/subscriptions/count
 * Get total subscription count (for admin purposes)
 */
router.get('/count', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const count = subscriptions.size;
    
    res.json({
      success: true,
      count,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error fetching subscription count', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * DELETE /api/subscriptions/:email
 * Unsubscribe email (for future use)
 */
router.delete('/:email', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const email = sanitizeEmail(req.params.email);
    
    if (!validateEmail(email)) {
      res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
      return;
    }

    const existed = subscriptions.delete(email);
    
    if (existed) {
      logger.info('Email unsubscribed', { email });
    }

    res.json({
      success: true,
      message: existed ? 'Successfully unsubscribed' : 'Email was not subscribed',
      wasSubscribed: existed
    });

  } catch (error) {
    logger.error('Error processing unsubscription', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;