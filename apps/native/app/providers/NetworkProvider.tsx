import { useTranslation } from '@repo/i18n/native';
import { Toaster, toast } from '@repo/ui-native/components/sonner';
import NetInfo from '@react-native-community/netinfo';
import { useEffect, useRef } from 'react';

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const wasOffline = useRef(false);

  useEffect(() => {
    return NetInfo.addEventListener((state) => {
      const isOffline = state.isConnected === false;

      if (isOffline && !wasOffline.current) {
        toast.error(t('errors.offline.title'), { description: t('errors.offline.message') });
      }
      wasOffline.current = isOffline;
    });
  }, [t]);

  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
