module.exports = async function (context, req) {
    context.log('GetUserInfo endpoint called');
    
    // Logga alla headers för debugging
    context.log('Headers:', JSON.stringify(req.headers, null, 2));
    
    try {
        // Försök hämta client principal (finns alltid i SWA)
        const clientPrincipalHeader = req.headers['x-ms-client-principal'];
        
        if (clientPrincipalHeader) {
            // Avkoda client principal
            const decoded = Buffer.from(clientPrincipalHeader, 'base64').toString('utf8');
            const clientPrincipal = JSON.parse(decoded);
            context.log('Client Principal:', JSON.stringify(clientPrincipal, null, 2));
            
            // Hämta användarinfo från client principal
            const userInfo = {
                name: clientPrincipal.userDetails,
                email: clientPrincipal.userDetails
            };
            
            // Försök hitta claims för namn
            if (clientPrincipal.claims) {
                const nameClaim = clientPrincipal.claims.find(c => c.typ === 'name' || c.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name');
                if (nameClaim) {
                    userInfo.name = nameClaim.val;
                }
            }
            
            context.res = {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    user: userInfo,
                    manager: null,
                    debug: {
                        hasAccessToken: !!req.headers['x-ms-token-aad-access-token'],
                        clientPrincipal: clientPrincipal
                    }
                }
            };
            return;
        }
        
        context.res = {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: { 
                user: null, 
                manager: null,
                error: 'Ingen client principal hittades' 
            }
        };

    } catch (error) {
        context.log.error('GetUserInfo error:', error);
        context.res = {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
            body: { error: 'Ett oväntat fel uppstod: ' + error.message }
        };
    }
};
