const { app } = require('@azure/functions');
const { Client } = require('@microsoft/microsoft-graph-client');
const { ClientSecretCredential } = require('@azure/identity');

app.http('GetUserInfo', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'GetUserInfo',
    handler: async (request, context) => {
        try {
            // Hämta användarens e-post från EasyAuth header
            const clientPrincipalHeader = request.headers.get('x-ms-client-principal');
            
            if (!clientPrincipalHeader) {
                return {
                    status: 401,
                    jsonBody: { error: 'Inte autentiserad' }
                };
            }

            // Avkoda client principal
            const clientPrincipal = JSON.parse(Buffer.from(clientPrincipalHeader, 'base64').toString('utf8'));
            const userEmail = clientPrincipal.userDetails;

            if (!userEmail) {
                return {
                    status: 400,
                    jsonBody: { error: 'Kunde inte hitta användarens e-post' }
                };
            }

            // Hämta Graph API konfiguration
            const clientId = process.env.GRAPH_CLIENT_ID;
            const clientSecret = process.env.GRAPH_CLIENT_SECRET;
            const tenantId = process.env.GRAPH_TENANT_ID;

            if (!clientId || !clientSecret || !tenantId) {
                context.error('Missing Graph API configuration');
                return {
                    status: 500,
                    jsonBody: { error: 'Server konfigurationsfel' }
                };
            }

            // Skapa Graph client med app-behörigheter
            const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
            const client = Client.initWithMiddleware({
                authProvider: {
                    getAccessToken: async () => {
                        const token = await credential.getToken('https://graph.microsoft.com/.default');
                        return token.token;
                    }
                }
            });

            // Hämta användarinfo från Graph API
            let userInfo = null;
            let managerInfo = null;

            try {
                // Hämta användaren baserat på e-post
                const user = await client.api(`/users/${userEmail}`)
                    .select('displayName,mail,userPrincipalName')
                    .get();

                userInfo = {
                    name: user.displayName,
                    email: user.mail || user.userPrincipalName
                };

                // Försök hämta chefens information
                try {
                    const manager = await client.api(`/users/${userEmail}/manager`)
                        .select('displayName,mail,userPrincipalName')
                        .get();

                    managerInfo = {
                        name: manager.displayName,
                        email: manager.mail || manager.userPrincipalName
                    };
                } catch (managerError) {
                    // Ingen chef hittades eller saknar behörighet
                    context.log('Kunde inte hämta chef:', managerError.message);
                    managerInfo = null;
                }

            } catch (userError) {
                context.error('Kunde inte hämta användarinfo:', userError.message);
                return {
                    status: 500,
                    jsonBody: { error: 'Kunde inte hämta användarinformation' }
                };
            }

            return {
                status: 200,
                jsonBody: {
                    user: userInfo,
                    manager: managerInfo
                }
            };

        } catch (error) {
            context.error('GetUserInfo error:', error);
            return {
                status: 500,
                jsonBody: { error: 'Ett oväntat fel uppstod' }
            };
        }
    }
});
