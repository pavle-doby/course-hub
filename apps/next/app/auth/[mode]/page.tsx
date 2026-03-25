'use client';

import { AuthScreen } from 'app/features/auth/screen';
import { useParams } from 'solito/navigation';

export default function Page() {
  const { mode } = useParams();
  return <AuthScreen mode={mode as string} />;
}
