module.exports = async function (context, req) {
    context.log('GetUserInfo endpoint called');
    
    try {
        // Hämta access token från EasyAuth header
        const accessToken = req.headers['x-ms-token-aad-access-token'];
        
        if (!accessToken) {
            context.log('Ingen access token tillgänglig');
            context.res = {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: { 
                    user: null, 
                    manager: null,
                    error: 'Ingen access token' 
                }
            };
            return;
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
            context.log.error('Graph API fel:', graphError.message);
        }

        context.res = {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: {
                user: userInfo,
                manager: managerInfo
            }
        };

    } catch (error) {
        context.log.error('GetUserInfo error:', error);
        context.res = {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
            body: { error: 'Ett oväntat fel uppstod' }
        };
    }
};
