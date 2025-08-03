import { Router, Request, Response } from 'express';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import { convertMainWhitepaper } from '../services/simpleWhitepaperConverter';

const router = Router();

/**
 * Convert whitepaper to PDF and DOCX formats
 * POST /api/whitepaper/convert
 */
router.post('/convert', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pipe(
      convertMainWhitepaper(),
      TE.fold(
        (error) => async () => ({
          success: false,
          error: error.message,
          errorType: error._tag
        }),
        (result) => async () => ({
          success: true,
          data: result
        })
      )
    )();

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Whitepaper successfully converted',
        data: {
          pdfPath: result.data.pdfPath,
          docxPath: result.data.docxPath,
          message: result.data.message
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        errorType: result.errorType
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      errorType: 'UnexpectedError'
    });
  }
});

/**
 * Health check endpoint
 * GET /api/whitepaper/health
 */
router.get('/health', (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'Whitepaper service is healthy',
    timestamp: new Date().toISOString()
  });
});

export default router;