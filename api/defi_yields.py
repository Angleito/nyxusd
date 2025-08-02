import json
import logging
import os
import sys
from typing import Optional
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from defi_yield_finder import DeFiYieldFinder

# Configure logging for Vercel
logging.basicConfig(
    level=os.environ.get("LOG_LEVEL", "INFO"),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def handler(request, response):
    """
    Vercel serverless function handler for DeFi yield finder.
    
    Query parameters:
    - min_safety_score: Minimum safety score (default: 60)
    - max_results: Maximum number of results (default: 20)
    - cache: Enable/disable caching (default: true)
    """
    
    # CORS headers
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Content-Type'] = 'application/json'
    
    # Handle OPTIONS request for CORS
    if request.method == "OPTIONS":
        response.status_code = 200
        return ""
    
    try:
        # Parse query parameters from URL
        from urllib.parse import parse_qs, urlparse
        parsed_url = urlparse(request.url)
        params = parse_qs(parsed_url.query)
        
        # Get parameters with defaults
        min_safety_score = int(params.get("min_safety_score", ["60"])[0])
        max_results = int(params.get("max_results", ["20"])[0])
        use_cache = params.get("cache", ["true"])[0].lower() == "true"
        
        # Validate parameters
        if not 0 <= min_safety_score <= 100:
            response.status_code = 400
            return json.dumps({
                "error": "min_safety_score must be between 0 and 100"
            })
        
        if not 1 <= max_results <= 100:
            response.status_code = 400
            return json.dumps({
                "error": "max_results must be between 1 and 100"
            })
        
        # Configure finder
        custom_config = {
            "MAX_RESULTS": max_results,
            "CACHE_ENABLED": use_cache,
            "REDIS_ENABLED": False  # Disable Redis for Vercel
        }
        
        # Initialize finder and get results
        finder = DeFiYieldFinder(custom_config=custom_config)
        result = finder.get_safe_base_yields(min_safety_score=min_safety_score)
        
        # Return successful response
        response.status_code = 200
        return json.dumps(result.to_dict())
        
    except Exception as e:
        logger.error(f"Error in DeFi yield finder: {str(e)}", exc_info=True)
        
        response.status_code = 500
        return json.dumps({
            "error": "Internal server error",
            "message": str(e) if os.environ.get("DEBUG") else "An error occurred processing your request"
        })

