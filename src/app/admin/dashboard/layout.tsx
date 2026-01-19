import Sidebar from '@/components/admin/Sidebar';
import { signOut } from '@/auth';
import { getNewApplicationCount } from '@/lib/application-actions';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const newApplicationCount = await getNewApplicationCount();

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-background">
      <div className="w-full flex-none md:w-64">
        <Sidebar newApplicationCount={newApplicationCount} />
      </div>
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12">
        {children}
      </div>
    </div>
  );
}
