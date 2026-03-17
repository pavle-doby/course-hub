'use client';

import { HomeScreen } from 'app/features/home/screen';
import { useRouter } from 'next/navigation';
import { useGetUserSelf } from '@my/api-client';

export default function Page() {
  const router = useRouter();
  const { data, isPending } = useGetUserSelf();

  console.log({ data, isPending });

  return <HomeScreen onLinkPress={() => router.push('/user/nate')} />;
}
