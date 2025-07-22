// Authentication middleware
function authenticate(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required',
            message: 'No token provided'
        });
    }

    // Here you would validate the JWT token
    // For now, this is a placeholder
    if (token === process.env.API_TOKEN) {
        next();
    } else {
        res.status(403).json({
            success: false,
            error: 'Invalid token',
            message: 'Authentication failed'
        });
    }
}

// API key validation middleware
function validateApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(401).json({
            success: false,
            error: 'Invalid API key',
            message: 'Valid API key required'
        });
    }
    
    next();
}

module.exports = {
    authenticate,
    validateApiKey
};
