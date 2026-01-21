import { getBrandingSettings } from '@/lib/settings-actions';
import LoginForm from './LoginForm';

export default async function LoginPage() {
  const { logoPath, logoRedirectUrl } = await getBrandingSettings();
  const homeLink = logoRedirectUrl || "https://www.mediasoftbd.com";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="mb-6 flex flex-col items-center justify-center">
          {logoPath ? (
            <a href={homeLink} target={logoRedirectUrl ? "_blank" : "_self"} rel={logoRedirectUrl ? "noopener noreferrer" : ""}>
               <img src={logoPath} alt="Company Logo" className="h-20 object-contain mb-4" />
            </a>
          ) : null}
          <h1 className="text-2xl font-bold text-center">Admin Login</h1>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}

// ... wait, I need to define LoginForm.
// I'll use a separate file for LoginForm to be clean, OR define it in the same file if I can (but mixing server/client in one file is tricky with directives).
// Actually, I can just make a small client component inline? No, directives apply to file.
// I will split this into `page.tsx` (server) and `LoginForm.tsx` (client).
