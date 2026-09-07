import { Icon } from '@repo/ui-native/components/icon';
import { UserIcon } from 'lucide-react-native';
import { Image, View } from 'react-native';
import { cn } from '@/lib/utils';

export function ProfileAvatar({
  avatarUrl,
  size = 88,
  className,
}: {
  avatarUrl?: string | null;
  size?: number;
  className?: string;
}) {
  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        className={className}
      />
    );
  }

  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className={cn('border-border bg-muted items-center justify-center border', className)}>
      <Icon as={UserIcon} className="text-muted-foreground size-1/2" />
    </View>
  );
}
