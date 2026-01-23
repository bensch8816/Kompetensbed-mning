const { app } = require('@azure/functions');

app.http('GetUserInfo', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'GetUserInfo',
    handler: async (request, context) => {
        context.log('GetUserInfo endpoint called');
        
        try {
            // Hämta access token från EasyAuth header
            const accessToken = request.headers.get('x-ms-token-aad-access-token');
            
            if (!accessToken) {
                context.log('Ingen access token tillgänglig');
                return {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        user: null, 
                        manager: null,
                        error: 'Ingen access token' 
                    })
                };
            }

            // Hämta användarinfo med delegerad token
            let userInfo = null;
            let managerInfo = null;

            try {
                // Hämta min profil
                const userResponse = await fetch('https://graph.microsoft.com/v1.0/me?$select=displayName,mail,userPrincipalName', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });

                if (userResponse.ok) {
                    const user = await userResponse.json();
                    userInfo = {
                        name: user.displayName,
                        email: user.mail || user.userPrincipalName
                    };
                    context.log('Användare hämtad:', userInfo.name);
                } else {
                    context.log('Kunde inte hämta användarprofil:', userResponse.status);
                }

                // Försök hämta chef
                const managerResponse = await fetch('https://graph.microsoft.com/v1.0/me/manager?$select=displayName,mail,userPrincipalName', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });

                if (managerResponse.ok) {
                    const manager = await managerResponse.json();
                    managerInfo = {
                        name: manager.displayName,
                        email: manager.mail || manager.userPrincipalName
                    };
                    context.log('Chef hämtad:', managerInfo.name);
                } else {
                    context.log('Kunde inte hämta chef:', managerResponse.status);
                }

            } catch (graphError) {
                context.error('Graph API fel:', graphError.message);
            }

            return {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user: userInfo,
                    manager: managerInfo
                })
            };

        } catch (error) {
            context.error('GetUserInfo error:', error);
            return {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Ett oväntat fel uppstod' })
            };
        }
    }
});
