import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function GuideTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>1. Google Cloud Setup</CardTitle>
          <CardDescription>Create a project and configure OAuth consent screen.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <ol className="list-decimal list-inside space-y-2">
            <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-primary hover:text-blue-700 transition-colors">Google Cloud Console</a> and create a <strong>New Project</strong>.</li>
            <li>Navigate to <strong>APIs & Services {'>'} OAuth consent screen</strong>.</li>
            <li>Select <strong>External</strong> User Type and click Create.</li>
            <li>Fill in App Name and Support Email (required fields only). Save & Continue.</li>
            <li><strong>IMPORTANT:</strong> On the summary page, click "PUBLISH APP" to set status to Production. (Avoids 7-day token expiry).</li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Create Credentials</CardTitle>
          <CardDescription>Generate Client ID and Client Secret.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <ol className="list-decimal list-inside space-y-2">
            <li>Go to <strong>APIs & Services {'>'} Credentials</strong>.</li>
            <li>Click <strong>+ CREATE CREDENTIALS</strong> and select <strong>OAuth client ID</strong>.</li>
            <li>Application type: <strong>Web application</strong>.</li>
            <li>Under "Authorized redirect URIs", click <strong>ADD URI</strong> and paste:
              <div className="mt-2 bg-muted p-2 rounded text-xs font-mono select-all">
                https://developers.google.com/oauthplayground
              </div>
            </li>
            <li>Click <strong>CREATE</strong>. Copy your <strong>Client ID</strong> and <strong>Client Secret</strong>.</li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Generate Refresh Token</CardTitle>
          <CardDescription>Get the refresh token from OAuth Playground.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <ol className="list-decimal list-inside space-y-2">
            <li>Go to <a href="https://developers.google.com/oauthplayground" target="_blank" rel="noreferrer" className="text-primary hover:text-blue-700 transition-colors">OAuth 2.0 Playground</a>.</li>
            <li>Click the <strong>Settings (⚙️)</strong> icon on the top right.</li>
            <li>Check "Use your own OAuth credentials" and paste your Client ID/Secret.</li>
            <li>On the left, find "Input your own scopes", paste this, and click Authorize:
              <div className="mt-2 bg-muted p-2 rounded text-xs font-mono select-all">
                https://mail.google.com/
              </div>
            </li>
            <li>Sign in with the Google Account you want to send emails from.</li>
            <li>Click "Exchange authorization code for tokens".</li>
            <li>Copy the <strong>Refresh Token</strong> (starts with 1//) and paste it in the Credentials tab.</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
