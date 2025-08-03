import { Router, Request, Response } from 'express';
import { vercelMemory } from '../services/vercelMemory';
import type { ChatMessage } from '../services/vercelMemory';

const router = Router();

// Append message to conversation
router.post('/messages', async (req: Request, res: Response) => {
  try {
    const { sessionId, message } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'sessionId and message are required' 
      });
    }
    
    const chatMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: message.role || 'user',
      content: message.content,
      timestamp: new Date(),
      metadata: message.metadata,
    };
    
    await vercelMemory.appendMessage(sessionId, chatMessage);
    
    res.json({ success: true, messageId: chatMessage.id });
  } catch (error) {
    console.error('Failed to append message:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to append message' 
    });
  }
});

// Get prompt context for AI
router.get('/context/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const context = await vercelMemory.getPromptContext(sessionId);
    
    res.json({ 
      success: true, 
      context,
      sessionId 
    });
  } catch (error) {
    console.error('Failed to get context:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get context' 
    });
  }
});

// Save/update user profile
router.post('/profile', async (req: Request, res: Response) => {
  try {
    const { walletAddress, profile } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({ 
        success: false, 
        error: 'walletAddress is required' 
      });
    }
    
    await vercelMemory.saveUserProfile(walletAddress, profile);
    
    res.json({ success: true, walletAddress });
  } catch (error) {
    console.error('Failed to save profile:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to save profile' 
    });
  }
});

// Archive conversation
router.post('/archive/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const archiveUrl = await vercelMemory.archiveConversation(sessionId);
    
    res.json({ 
      success: true, 
      archiveUrl,
      sessionId 
    });
  } catch (error) {
    console.error('Failed to archive conversation:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to archive conversation' 
    });
  }
});

export default router;