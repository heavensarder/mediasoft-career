import { getBrandingSettings } from '@/lib/settings-actions';
import LoginForm from './LoginForm';

export default async function LoginPage() {
  const { logoPath, logoRedirectUrl } = await getBrandingSettings();
  const homeLink = logoRedirectUrl || "https://www.mediasoftbd.com";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50">
      {/* Light Theme Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Soft Gradient Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-sky-200/40 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-200/40 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-purple-200/30 rounded-full blur-[80px]" />

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      {/* Glassmorphic Card - Light Version */}
      <div className="relative z-10 w-full max-w-md p-6 mx-4">
        <div className="group relative bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-8 sm:p-10 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500">

          {/* Top shine effect */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sky-400/20 to-transparent" />

          <div className="relative flex flex-col items-center justify-center mb-8">
            {logoPath ? (
              <a
                href={homeLink}
                target={logoRedirectUrl ? "_blank" : "_self"}
                rel={logoRedirectUrl ? "noopener noreferrer" : ""}
                className="transition-transform hover:scale-105 duration-300"
              >
                <img src={logoPath} alt="Company Logo" className="h-[70px] object-contain mb-6 drop-shadow-sm" />
              </a>
            ) : (
              <div className="h-16 w-16 bg-gradient-to-tr from-sky-400 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-sky-400/20 rotate-3 transform hover:rotate-6 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
            )}
            <h1 className="text-2xl font-bold text-center text-slate-800 tracking-tight">Welcome Back</h1>
            <p className="text-slate-500 text-sm mt-2 font-medium">Log in to manage your career portal</p>
          </div>

          <LoginForm />
        </div>

        {/* Footer Text */}
        <p className="text-center text-slate-400 text-xs mt-6 font-medium">
          &copy; {new Date().getFullYear()} <a href="https://www.mediasoftbd.com" target="_blank" rel="noopener noreferrer" className="hover:text-sky-500 transition-colors">Mediasoft Data Systems Limited</a>. All rights reserved.
        </p>
      </div>
    </div>
  );
}
