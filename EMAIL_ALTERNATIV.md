# ENKEL E-POSTL\u00d6SNING - Mailto-l\u00e4nk (Ingen Azure-konfiguration beh\u00f6vs!)

## \ud83d\udca1 Problem: App Registration kr\u00e4ver admin-r\u00e4ttigheter

Din anv\u00e4ndare saknar r\u00e4ttigheter att skapa App Registrations i Entra ID.

## \u2705 Enklaste L\u00f6sningen: mailto:-l\u00e4nk

Ist\u00e4llet f\u00f6r att skicka e-post via Azure, kan vi anv\u00e4nda en `mailto:`-l\u00e4nk som \u00f6ppnar anv\u00e4ndarens e-postklient med f\u00f6rifylld data.

### F\u00f6rdelar:
- \u2705 Ingen Azure-konfiguration beh\u00f6vs
- \u2705 Fungerar direkt utan admin-r\u00e4ttigheter
- \u2705 Anv\u00e4ndaren ser e-posten innan den skickas
- \u2705 Perfekt f\u00f6r tempor\u00e4ra l\u00f6sningar (100 personer, ett tillf\u00e4lle)

### Nackdelar:
- \u274c Beroende av anv\u00e4ndarens e-postklient (Outlook, Gmail, etc.)
- \u274c Begr\u00e4nsad formattering (plain text)
- \u274c Anv\u00e4ndaren m\u00e5ste manuellt trycka \"skicka\"

## \ud83d\udee0\ufe0f Implementation

Koden \u00e4r redan f\u00f6rberedd! Vi beh\u00f6ver bara \u00e4ndra `skickaEmailRapport()`-funktionen.

### Alternativ: Logic App (Kr\u00e4ver inga extra r\u00e4ttigheter!)

**Rekommendation f\u00f6r detta use case:**

1. Skapa en Azure Logic App med HTTP-trigger
2. L\u00e4gg till \"Send an email (V2)\" action med din Office 365-koppling
3. Anropa Logic App-URL:en fr\u00e5n din JavaScript-kod

**Ingen App Registration beh\u00f6vs** - Logic Apps anv\u00e4nder inbyggd OAuth!

## \ud83d\udc65 Rekommendation f\u00f6r IT-admin

Om du vill ha full e-postautomation, be din IT-admin:

1. **Skapa App Registration:**
   - Namn: `kompetensbedomning-mail-sender`
   - API Permissions: `Microsoft Graph > Mail.Send` (Application)
   - Admin Consent: **Ja**

2. **Skapa Client Secret** och dela v\u00e4rdena:
   - Application (client) ID
   - Client Secret Value
   - Directory (tenant) ID

3. **Konfigurera i Azure Static Web App:**
   ```powershell
   az staticwebapp appsettings set --name kompetensbedomning-app --resource-group kompetensbedomning-rg --setting-names GRAPH_CLIENT_ID="<client-id>" GRAPH_CLIENT_SECRET="<secret>" GRAPH_TENANT_ID="<tenant-id>" SENDER_EMAIL="noreply@yourdomain.com"
   ```

## \u26a1 Snabbfix: Uppdatera till mailto:-l\u00e4nk

Vill du att jag \u00e4ndrar koden till en mailto:-l\u00e4nk ist\u00e4llet? Det fungerar **direkt** utan n\u00e5gon Azure-konfiguration!
