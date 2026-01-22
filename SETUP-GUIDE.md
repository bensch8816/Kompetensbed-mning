# SNABB SETUP-GUIDE

## ✅ Status: Koden är pushad till GitHub!

Repository: https://github.com/Halmstad-Utveckling-och-Digitalisering/kompetensbedomning

## 📋 Sista stegen (5 minuter):

### Steg 1: Lägg till GitHub Secret för deployment

1. Gå till: https://github.com/Halmstad-Utveckling-och-Digitalisering/kompetensbedomning/settings/secrets/actions
2. Klicka **"New repository secret"**
3. Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
4. Value: (se filen `deployment-token.txt` i projektet)
5. Klicka **"Add secret"**

### Steg 2: Trigga deployment

```powershell
git add .github/workflows/azure-static-web-apps.yml
git commit -m "Add GitHub Actions workflow"
git push
```

Detta kommer automatiskt att deployas via GitHub Actions!

### Steg 3: Aktivera Entra ID Authentication (Azure Portal)

1. Öppna: https://portal.azure.com/#view/HubsExtension/BrowseResource/resourceType/Microsoft.Web%2FstaticSites
2. Välj **"kompetensbedomning-app"**
3. Gå till **Settings > Configuration > Authentication**
4. Klicka **"+ Add"**
5. Välj **"Azure Active Directory"**
6. Välj **"Express"** (automatisk konfiguration)
7. Under "Action to take when request is not authenticated", välj **"Redirect to login"**
8. Klicka **"Save"**

**KLART!** 🎉

### Steg 4: Testa appen

Efter ~2 minuter (när GitHub Actions är klart):
1. Öppna: https://jolly-river-0e566e103.6.azurestaticapps.net
2. Du kommer automatiskt att omdirigeras till Microsoft-inloggning
3. Logga in med ditt Entra ID-konto
4. Fyll i bedömningen
5. Testa "Skicka per e-post" - din e-postklient öppnas med förifylld text

## 📧 Hur e-postfunktionen fungerar

**Mailto-lösning** = Ingen Azure-konfiguration behövs!

När användaren klickar "Skicka per e-post":
1. Dialogruta frågar efter mottagarens e-post
2. Textbaserad rapport genereras automatiskt
3. Användarens e-postklient (Outlook, Gmail, etc.) öppnas med:
   - Mottagare förifylld
   - Ämne: "Kompetensbedömning IT-service - [Befattning]"
   - Innehåll: Sammanfattning av bedömningen
4. Användaren kan redigera och skicka

**Tips:** För fullständig rapport rekommenderas:
- Klicka "Visa rapport" → Skriv ut → Spara som PDF
- Bifoga PDF:en till e-posten

## 🔍 Övervaka deployment

GitHub Actions: https://github.com/Halmstad-Utveckling-och-Digitalisering/kompetensbedomning/actions

## ⚙️ Om ni vill byta till automatisk e-post senare

Se [EMAIL_ALTERNATIV.md](EMAIL_ALTERNATIV.md) för instruktioner om hur IT-admin kan sätta upp Microsoft Graph API-integration.
