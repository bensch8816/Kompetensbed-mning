# Kompetensbed\u00f6mning IT-service - Deployment Guide

## \ud83c\udfaf Vad har skapats

Din Azure Static Web App \u00e4r nu skapad med:
- **URL**: https://jolly-river-0e566e103.6.azurestaticapps.net
- **Resource Group**: kompetensbedomning-rg
- **Location**: West Europe

## \ud83d\udce6 N\u00e4sta steg: Deployment

### Alternativ 1: GitHub-integration (Rekommenderas)

1. **Skapa GitHub repo:**
   ```bash
   # Skapa ett nytt repo p\u00e5 github.com (t.ex. "kompetensbedomning")
   # Sedan:
   git remote add origin https://github.com/<DIN-ORG>/kompetensbedomning.git
   git push -u origin main
   ```

2. **Koppla GitHub till Azure SWA:**
   ```bash
   az staticwebapp update --name kompetensbedomning-app --resource-group kompetensbedomning-rg --source https://github.com/<DIN-ORG>/kompetensbedomning
   ```

   Azure SWA kommer automatiskt att:
   - Skapa GitHub Actions workflow
   - Bygga och deploya vid varje push
   - Deploya b\u00e5de HTML och Azure Functions

### Alternativ 2: Azure Portal Upload

1. G\u00e5 till Azure Portal
2. \u00d6ppna Static Web App "kompetensbedomning-app"
3. V\u00e4lj "Deployment" > "Upload files"
4. Ladda upp alla filer (index.html, staticwebapp.config.json, api-mappen)

## \ud83d\udd10 Konfigurera Entra ID Auth (Inbyggd)

### Steg 1: Aktivera AAD Authentication

I din Static Web App i Azure Portal:

1. G\u00e5 till **Configuration** > **Authentication**
2. Under "Identity provider", v\u00e4lj **Add**
3. V\u00e4lj **Azure Active Directory**
4. V\u00e4lj **Express** (automatisk konfiguration)
5. **Tillg\u00e5ngsbegr\u00e4nsning**: V\u00e4lj "Require authentication"
6. Spara

Detta kr\u00e4ver **INGEN app registration manuellt** - Azure SWA skapar detta automatiskt!

### Steg 2: Begr\u00e4nsa till er tenant (valfritt)

Om du vill att endast anv\u00e4ndare fr\u00e5n er organisation ska kunna logga in:

1. G\u00e5 till **Entra ID** > **App registrations**
2. S\u00f6k efter din app (namnet kommer vara typ "swa-<app-name>")
3. V\u00e4lj den och g\u00e5 till **Authentication**
4. Under "Supported account types", v\u00e4lj:\n   - **Accounts in this organizational directory only**
5. Spara

## \ud83d\udce7 Konfigurera E-postfunktionalitet (Microsoft Graph)

### Steg 1: Skapa App Registration f\u00f6r Graph API

```powershell
# Skapa app registration
az ad app create --display-name "kompetensbedomning-mail-sender" --sign-in-audience AzureADMyOrg

# H\u00e4mta App ID
$appId = az ad app list --display-name "kompetensbedomning-mail-sender" --query "[0].appId" -o tsv

# Skapa service principal
az ad sp create --id $appId

# Skapa client secret (spara detta v\u00e4rde!)
az ad app credential reset --id $appId --append
```

### Steg 2: L\u00e4gg till Graph API Permissions

```powershell
# L\u00e4gg till Mail.Send permission
az ad app permission add --id $appId --api 00000003-0000-0000-c000-000000000000 --api-permissions e383f46e-2787-4529-855e-0e479a3ffac0=Role

# Admin consent (kr\u00e4ver Global Admin)
az ad app permission admin-consent --id $appId
```

### Steg 3: Konfigurera Function App Settings

```powershell
# H\u00e4mta tenant ID
$tenantId = az account show --query tenantId -o tsv

# S\u00e4tt app settings
az staticwebapp appsettings set --name kompetensbedomning-app --resource-group kompetensbedomning-rg --setting-names GRAPH_CLIENT_ID=$appId GRAPH_CLIENT_SECRET="<DIN-SECRET>" GRAPH_TENANT_ID=$tenantId SENDER_EMAIL="noreply@yourdomain.com"
```

**Viktigt**: Ers\u00e4tt `<DIN-SECRET>` med det client secret du fick i steg 1!

### Steg 4: Verifiera Graph API beh\u00f6righeter

I Azure Portal:
1. G\u00e5 till **Entra ID** > **App registrations**
2. V\u00e4lj "kompetensbedomning-mail-sender"
3. **API permissions** - ska visa:
   - Microsoft Graph > Mail.Send (Application)
   - Status: **Granted for [your organization]**

## \ud83d\udcdd Slutf\u00f6r Deployment

### Om du anv\u00e4nder GitHub:

```bash
git push
```

GitHub Actions kommer automatiskt att deploya din app!

### Om du anv\u00e4nder Azure Portal:

Ladda upp filerna manuellt enligt Alternativ 2 ovan.

## \u2705 Testa Appen

1. \u00d6ppna: https://jolly-river-0e566e103.6.azurestaticapps.net
2. Du kommer att omdirigeras till Microsoft-inloggning
3. Logga in med ditt Entra ID-konto
4. Fyll i bed\u00f6mningen
5. Testa "Skicka per e-post"-knappen

## \ud83d\udd27 Fels\u00f6kning

### Auth fungerar inte
- Kontrollera att Authentication \u00e4r konfigurerad i Azure Portal
- Verifiera att `staticwebapp.config.json` finns i root

### E-post fungerar inte
- Kontrollera att alla app settings \u00e4r konfigurerade
- Verifiera Graph API permissions har admin consent
- Kolla Function App-loggar i Azure Portal

### API-anrop fungerar inte
- Kontrollera att `api/`-mappen deployades korrekt
- Verifiera att Node.js-beroenden installerades (vid GitHub Actions)
- K\u00f6r: `cd api && npm install` innan deployment

## \ud83d\udcca Resurser

- **Static Web App**: https://jolly-river-0e566e103.6.azurestaticapps.net
- **Azure Portal**: https://portal.azure.com/#@/resource/subscriptions/fbf05911-44f9-4565-9d22-9a6cb8d16ee9/resourceGroups/kompetensbedomning-rg/providers/Microsoft.Web/staticSites/kompetensbedomning-app
- **Tenant ID**: 78a88712-586a-44a3-b2d9-d0ed2b991cd2
