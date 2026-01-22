const { app } = require('@azure/functions');
const { Client } = require('@microsoft/microsoft-graph-client');
const { ClientSecretCredential } = require('@azure/identity');

app.http('send-report', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            // Parse request body
            const body = await request.json();
            const { recipientEmail, recipientName, reportHtml, assessmentData } = body;

            // Validate input
            if (!recipientEmail || !reportHtml) {
                return {
                    status: 400,
                    body: JSON.stringify({ error: 'Missing required fields: recipientEmail, reportHtml' })
                };
            }

            // Get configuration from environment variables
            const clientId = process.env.GRAPH_CLIENT_ID;
            const clientSecret = process.env.GRAPH_CLIENT_SECRET;
            const tenantId = process.env.GRAPH_TENANT_ID;
            const senderEmail = process.env.SENDER_EMAIL || 'noreply@yourcompany.com';

            if (!clientId || !clientSecret || !tenantId) {
                context.error('Missing Graph API configuration');
                return {
                    status: 500,
                    body: JSON.stringify({ error: 'Server configuration error' })
                };
            }

            // Create credential and Graph client
            const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
            const client = Client.initWithMiddleware({
                authProvider: {
                    getAccessToken: async () => {
                        const token = await credential.getToken('https://graph.microsoft.com/.default');
                        return token.token;
                    }
                }
            });

            // Prepare email message
            const emailSubject = `Kompetensbedömning IT-service - ${assessmentData?.befattning || 'Resultat'}`;
            const message = {
                message: {
                    subject: emailSubject,
                    body: {
                        contentType: 'HTML',
                        content: reportHtml
                    },
                    toRecipients: [
                        {
                            emailAddress: {
                                address: recipientEmail,
                                name: recipientName || recipientEmail
                            }
                        }
                    ],
                    from: {
                        emailAddress: {
                            address: senderEmail
                        }
                    }
                },
                saveToSentItems: false
            };

            // Send email via Graph API
            await client.api(`/users/${senderEmail}/sendMail`).post(message);

            context.log(`Email sent successfully to ${recipientEmail}`);

            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    success: true,
                    message: 'E-post skickad!'
                })
            };

        } catch (error) {
            context.error('Error sending email:', error);
            
            return {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    success: false,
                    error: 'Kunde inte skicka e-post',
                    details: error.message
                })
            };
        }
    }
});
