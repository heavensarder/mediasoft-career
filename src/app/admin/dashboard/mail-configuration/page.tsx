import { getMailConfig } from './actions';
import MailConfigurationClient from './client';

export default async function MailConfigurationPage() {
  const result = await getMailConfig();
  
  // If getMailConfig fails or returns null data (shouldn't happen due to logic), provide empty defaults
  const initialData = result.success && result.data ? result.data : {
    senderEmail: '',
    clientId: '',
    clientSecret: '',
    refreshToken: '',
    notificationSubject: '',
    notificationBody: '',
    isAutoReplyEnabled: false,
    autoReplySubject: '',
    autoReplyBody: '',
  };

  return (
    <MailConfigurationClient initialData={initialData as any} /> 
  );
}
