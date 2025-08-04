import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios, { AxiosError } from 'axios';
import type { SwapQuoteRequest, SwapExecuteRequest, SwapQuote, ApiResponse, ErrorResponse, ValidationError } from './types/shared.js';
import { setCorsHeaders, handleOptions, validateMethod, sendMethodNotAllowed } from './utils/cors.js';
import * as E from 'fp-ts/lib/Either.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import * as O from 'fp-ts/lib/Option.js';
import { pipe } from 'fp-ts/lib/function.js';

/**
 * Action types for swap operations
 */
type SwapAction = 'quote' | 'execute';

/**
 * Odos API response interfaces for type safety
 */
interface OdosQuoteResponse {
  readonly outAmounts: ReadonlyArray<string>;
  readonly priceImpact?: number;
  readonly gasEstimate?: number;
  readonly pathId: string;
  readonly transaction?: {
    readonly to: string;
    readonly data: string;
    readonly value: string;
  };
}

interface OdosAssembleResponse {
  readonly transaction: {
    readonly to: string;
    readonly data: string;
    readonly value: string;
    readonly gas: string;
  };
}

/**
 * Transaction data interface
 */
interface TransactionData {
  readonly to: string;
  readonly data: string;
  readonly value: string;
  readonly gasLimit: string;
}

/**
 * Error types for better error handling
 */
type SwapError = 
  | { readonly type: 'VALIDATION_ERROR'; readonly errors: ReadonlyArray<ValidationError> }
  | { readonly type: 'ODOS_API_ERROR'; readonly message: string; readonly status: number }
  | { readonly type: 'INVALID_ACTION'; readonly action: string }
  | { readonly type: 'INTERNAL_ERROR'; readonly message: string };

/**
 * Validate swap action parameter
 */
const validateAction = (action: unknown): E.Either<SwapError, SwapAction> => {
  if (typeof action !== 'string') {
    return E.left({ type: 'INVALID_ACTION', action: String(action) });
  }
  
  if (action === 'quote' || action === 'execute') {
    return E.right(action);
  }
  
  return E.left({ type: 'INVALID_ACTION', action });
};

/**
 * Validate required string field
 */
const validateRequiredString = (value: unknown, fieldName: string): E.Either<ValidationError, string> => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return E.left({ field: fieldName, message: `${fieldName} is required and must be a non-empty string` });
  }
  return E.right(value.trim());
};

/**
 * Validate required number field
 */
const validateRequiredNumber = (value: unknown, fieldName: string): E.Either<ValidationError, number> => {
  if (typeof value !== 'number' || isNaN(value) || value < 0) {
    return E.left({ field: fieldName, message: `${fieldName} must be a non-negative number` });
  }
  return E.right(value);
};

/**
 * Validate swap quote request using functional validation
 */
const validateSwapQuoteRequest = (body: unknown): E.Either<SwapError, SwapQuoteRequest> => {
  if (!body || typeof body !== 'object') {
    return E.left({ 
      type: 'VALIDATION_ERROR', 
      errors: [{ field: 'body', message: 'Request body is required' }] 
    });
  }

  const request = body as Record<string, unknown>;
  const errors: ValidationError[] = [];

  const inputToken = validateRequiredString(request['inputToken'], 'inputToken');
  const outputToken = validateRequiredString(request['outputToken'], 'outputToken');
  const inputAmount = validateRequiredString(request['inputAmount'], 'inputAmount');
  const userAddress = validateRequiredString(request['userAddress'], 'userAddress');
  const slippageTolerance = validateRequiredNumber(request['slippageTolerance'], 'slippageTolerance');

  if (E.isLeft(inputToken)) errors.push(inputToken.left);
  if (E.isLeft(outputToken)) errors.push(outputToken.left);
  if (E.isLeft(inputAmount)) errors.push(inputAmount.left);
  if (E.isLeft(userAddress)) errors.push(userAddress.left);
  if (E.isLeft(slippageTolerance)) errors.push(slippageTolerance.left);

  if (errors.length > 0) {
    return E.left({ type: 'VALIDATION_ERROR', errors });
  }

  return E.right({
    inputToken: (inputToken as E.Right<string>).right,
    outputToken: (outputToken as E.Right<string>).right,
    inputAmount: (inputAmount as E.Right<string>).right,
    userAddress: (userAddress as E.Right<string>).right,
    slippageTolerance: (slippageTolerance as E.Right<number>).right
  });
};

/**
 * Validate swap execute request using functional validation
 */
const validateSwapExecuteRequest = (body: unknown): E.Either<SwapError, SwapExecuteRequest> => {
  const quoteValidation = validateSwapQuoteRequest(body);
  
  if (E.isLeft(quoteValidation)) {
    return quoteValidation;
  }

  if (!body || typeof body !== 'object') {
    return E.left({ 
      type: 'VALIDATION_ERROR', 
      errors: [{ field: 'body', message: 'Request body is required' }] 
    });
  }

  const request = body as Record<string, unknown>;
  const errors: ValidationError[] = [];

  const pathId = validateRequiredString(request['pathId'], 'pathId');
  const routerAddress = validateRequiredString(request['routerAddress'], 'routerAddress');
  const callData = validateRequiredString(request['callData'], 'callData');
  const value = validateRequiredString(request['value'], 'value');

  if (E.isLeft(pathId)) errors.push(pathId.left);
  if (E.isLeft(routerAddress)) errors.push(routerAddress.left);
  if (E.isLeft(callData)) errors.push(callData.left);
  if (E.isLeft(value)) errors.push(value.left);

  if (errors.length > 0) {
    return E.left({ type: 'VALIDATION_ERROR', errors });
  }

  const quoteRequest = quoteValidation.right;

  return E.right({
    ...quoteRequest,
    pathId: (pathId as E.Right<string>).right,
    routerAddress: (routerAddress as E.Right<string>).right,
    callData: (callData as E.Right<string>).right,
    value: (value as E.Right<string>).right
  });
};

/**
 * Call Odos API for quote using TaskEither
 */
const getOdosQuote = (request: SwapQuoteRequest): TE.TaskEither<SwapError, OdosQuoteResponse> =>
  TE.tryCatch(
    async () => {
      const response = await axios.post<OdosQuoteResponse>('https://api.odos.xyz/sor/quote/v2', {
        chainId: 8453, // Base chain
        inputTokens: [{
          tokenAddress: request.inputToken,
          amount: request.inputAmount
        }],
        outputTokens: [{
          tokenAddress: request.outputToken,
          proportion: 1
        }],
        userAddr: request.userAddress,
        slippageLimitPercent: request.slippageTolerance,
        sourceBlacklist: [],
        sourceWhitelist: [],
        simulate: false,
        pathViz: false,
        disableRFQs: false
      });
      
      return response.data;
    },
    (error): SwapError => {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || error.message;
        return { type: 'ODOS_API_ERROR', message: `Odos quote error: ${message}`, status };
      }
      return { type: 'INTERNAL_ERROR', message: 'Failed to get quote from Odos' };
    }
  );

/**
 * Call Odos API for transaction assembly using TaskEither
 */
const assembleOdosTransaction = (request: SwapExecuteRequest): TE.TaskEither<SwapError, OdosAssembleResponse> =>
  TE.tryCatch(
    async () => {
      const response = await axios.post<OdosAssembleResponse>('https://api.odos.xyz/sor/assemble', {
        userAddr: request.userAddress,
        pathId: request.pathId,
        simulate: false
      });
      
      return response.data;
    },
    (error): SwapError => {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || error.message;
        return { type: 'ODOS_API_ERROR', message: `Odos assemble error: ${message}`, status };
      }
      return { type: 'INTERNAL_ERROR', message: 'Failed to assemble transaction from Odos' };
    }
  );

/**
 * Transform Odos quote response to our SwapQuote format
 */
const transformOdosQuote = (request: SwapQuoteRequest, odosQuote: OdosQuoteResponse): SwapQuote => ({
  inputAmount: request.inputAmount,
  outputAmount: odosQuote.outAmounts[0] || '0',
  priceImpact: odosQuote.priceImpact || 0,
  gasEstimate: odosQuote.gasEstimate?.toString() || '0',
  pathId: odosQuote.pathId,
  routerAddress: odosQuote.transaction?.to || '',
  callData: odosQuote.transaction?.data || '0x',
  value: odosQuote.transaction?.value || '0'
});

/**
 * Transform Odos assemble response to TransactionData format
 */
const transformOdosTransaction = (odosResponse: OdosAssembleResponse): TransactionData => ({
  to: odosResponse.transaction.to,
  data: odosResponse.transaction.data,
  value: odosResponse.transaction.value,
  gasLimit: odosResponse.transaction.gas
});

/**
 * Process swap quote request using functional composition
 */
const processQuoteRequest = (body: unknown): TE.TaskEither<SwapError, SwapQuote> =>
  pipe(
    validateSwapQuoteRequest(body),
    TE.fromEither,
    TE.chain((request) =>
      pipe(
        getOdosQuote(request),
        TE.map((odosQuote) => transformOdosQuote(request, odosQuote))
      )
    )
  );

/**
 * Process swap execute request using functional composition
 */
const processExecuteRequest = (body: unknown): TE.TaskEither<SwapError, TransactionData> =>
  pipe(
    validateSwapExecuteRequest(body),
    TE.fromEither,
    TE.chain((request) =>
      pipe(
        assembleOdosTransaction(request),
        TE.map(transformOdosTransaction)
      )
    )
  );

/**
 * Handle swap error and send appropriate response
 */
const handleSwapError = (res: VercelResponse, error: SwapError): void => {
  console.error('Swap API error:', {
    type: error.type,
    error,
    timestamp: new Date().toISOString()
  });

  switch (error.type) {
    case 'VALIDATION_ERROR':
      const validationResponse: ErrorResponse = {
        success: false,
        error: 'Validation failed',
        validationErrors: error.errors
      };
      res.status(400).json(validationResponse);
      break;

    case 'ODOS_API_ERROR':
      const odosResponse: ErrorResponse = {
        success: false,
        error: error.message
      };
      res.status(error.status >= 400 && error.status < 600 ? error.status : 502).json(odosResponse);
      break;

    case 'INVALID_ACTION':
      const actionResponse: ErrorResponse = {
        success: false,
        error: `Invalid action: ${error.action}. Use "quote" or "execute"`
      };
      res.status(400).json(actionResponse);
      break;

    case 'INTERNAL_ERROR':
    default:
      const internalResponse: ErrorResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(internalResponse);
      break;
  }
};

/**
 * Swap endpoint handler with functional error handling
 * 
 * Handles both quote and execute actions for token swaps using Odos API.
 * Implements functional programming patterns with fp-ts for robust error handling.
 * 
 * @param req - Vercel request object
 * @param res - Vercel response object
 * @returns Promise<void> - Resolves when response is sent
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Set CORS headers
  setCorsHeaders(res, { methods: 'GET,POST,OPTIONS' });
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }

  // Validate action parameter
  const actionValidation = validateAction(req.query['action']);
  if (E.isLeft(actionValidation)) {
    return handleSwapError(res, actionValidation.left);
  }

  const action = actionValidation.right;

  // Validate HTTP method for the action
  if (!validateMethod(req.method, ['POST'])) {
    return sendMethodNotAllowed(res, ['POST']);
  }

  // Process request based on action using functional composition
  const processor = action === 'quote' ? processQuoteRequest : processExecuteRequest;
  
  await pipe(
    processor(req.body),
    TE.fold(
      // Error case - handle with appropriate error response
      (error: SwapError) => async (): Promise<void> => {
        handleSwapError(res, error);
      },
      // Success case - return data with proper typing
      (data: SwapQuote | TransactionData) => async (): Promise<void> => {
        const response: ApiResponse<SwapQuote | TransactionData> = {
          success: true,
          data,
          timestamp: new Date().toISOString()
        };
        
        res.status(200).json(response);
      }
    )
  )();
}