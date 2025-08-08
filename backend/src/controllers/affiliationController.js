const axios = require('axios');

// Configuration - Consider moving to environment variables for production
const WORDPRESS_API_URL = 'https://yuuyasumi.com/wp-json/myapi/v1';
const SHARED_SECRET = 'KnixnLd3'; // Same secret as WordPress

// Mapping of page/product IDs to affiliate URLs
// In production, consider storing this in database for easier management
const AFFILIATE_URL_MAPPING = {
  86: {
    url: "//ck.jp.ap.valuecommerce.com/servlet/referral?sid=3736574&pid=891642258",
    name: "Yahoo ショッピング",
    category: "ショッピング"
  },
  195: {
    url: "//ck.jp.ap.valuecommerce.com/servlet/referral?sid=3736574&pid=891718679",
    name: "Expedia", 
    category: "旅行"
  },
  203: {
    url: "//ck.jp.ap.valuecommerce.com/servlet/referral?sid=3736574&pid=891642257",
    name: "ファッション",
    category: "ファッション"
  },
  301: {
    url: "https://rpx.a8.net/svt/ejp?a8mat=455G3P+70FU1M+2HOM+656YP&rakuten=y&a8ejpredirect=http%3A%2F%2Fhb.afl.rakuten.co.jp%2Fhgc%2F0ea62065.34400275.0ea62066.204f04c0%2Fa25051679799_455G3P_70FU1M_2HOM_656YP%3Fpc%3Dhttp%253A%252F%252Fwww.rakuten.co.jp%252F%26m%3Dhttp%253A%252F%252Fm.rakuten.co.jp%252F",
    name: "楽天市場",
    category: "ショッピング"
  }
  // Add more mappings as needed
};

/**
 * Validate token against WordPress API
 */
const validateToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    // Get the requesting domain
    const domain = req.get('origin') || req.get('host') || 'app.rakurabu.com';

    console.log('🔍 Token validation request:');
    console.log('- Token:', token);
    console.log('- Domain:', domain);
    console.log('- WordPress API URL:', `${WORDPRESS_API_URL}/validate-external-token`);
    
    // Call WordPress API to validate token
    const response = await axios.post(`${WORDPRESS_API_URL}/validate-external-token`, {
      token: token,
      secret: SHARED_SECRET,
      domain: domain
    });

    console.log('✅ WordPress API response:', response.data);

    if (response.data.success) {
      return res.json({
        success: true,
        message: 'Token is valid',
        origin: response.data.origin
      });
    } else {
      return res.status(401).json({
        success: false,
        message: response.data.message || 'Token validation failed'
      });
    }

  } catch (error) {
    console.error('Token validation error details:');
    console.error('- Error message:', error.message);
    console.error('- Error code:', error.code);
    console.error('- Error stack:', error.stack);
    
    if (error.response) {
      console.error('- Response status:', error.response.status);
      console.error('- Response data:', error.response.data);
      console.error('- Response headers:', error.response.headers);
    }
    
    // Handle different types of errors
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: error.response.data.message || 'Token validation failed'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error during token validation',
      debug: {
        errorMessage: error.message,
        errorCode: error.code
      }
    });
  }
};

/**
 * Get redirect URL for a specific page/product ID
 */
const getRedirectUrl = async (req, res) => {
  try {
    const { pageId } = req.params;
    const { token } = req.query;

    // Convert pageId to number
    const numericPageId = parseInt(pageId, 10);
    
    if (!numericPageId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid page ID'
      });
    }

    // Check if we have a URL mapping for this page
    const affiliateData = AFFILIATE_URL_MAPPING[numericPageId];
    
    if (!affiliateData) {
      return res.status(404).json({
        success: false,
        message: 'No affiliate URL found for this page ID'
      });
    }

    const affiliateUrl = affiliateData.url;

    // If token is provided, validate it first
    if (token) {
      try {
        const domain = req.get('origin') || req.get('host') || 'app.rakurabu.com';
        
        const validationResponse = await axios.post(`${WORDPRESS_API_URL}/validate-external-token`, {
          token: token,
          secret: SHARED_SECRET,
          domain: domain
        });

        if (!validationResponse.data.success) {
          return res.status(401).json({
            success: false,
            message: 'Invalid token'
          });
        }
      } catch (error) {
        console.error('Token validation error in redirect:', error.message);
        return res.status(401).json({
          success: false,
          message: 'Token validation failed'
        });
      }
    }

    // Return the affiliate URL
    return res.json({
      success: true,
      pageId: numericPageId,
      redirectUrl: affiliateUrl,
      affiliateName: affiliateData.name,
      category: affiliateData.category,
      hasToken: !!token
    });

  } catch (error) {
    console.error('Get redirect URL error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  validateToken,
  getRedirectUrl
};
