'use client';
import { ReactNode } from 'react';
// import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import { UIButton, UIButtonProps } from './UIButton';

type ImageUpdateProps = UIButtonProps & {
  children?: ReactNode;
  onUpload: (props: { url: string; file: File | null }) => void; // File for web, URI string for native
};

export function UIUploadImage({ children, onUpload, ...other }: ImageUpdateProps) {
  async function handlePickImage() {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (event: Event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
          const url = URL.createObjectURL(file);
          onUpload({ url, file });
        }
      };
      input.click();
    } else {
      // const result = await ImagePicker.launchImageLibraryAsync({
      //   mediaTypes: ImagePicker.MediaTypeOptions.Images,
      //   allowsEditing: true,
      //   quality: 1,
      // });
      // if (!result.canceled) {
      //   const uri = result.assets[0].uri;
      //   onUpload({ url: uri, file: null });
      // }
    }
  }

  return (
    <UIButton
      {...other}
      onPress={handlePickImage}
    >
      {children || 'Upload Image'}
    </UIButton>
  );
}
