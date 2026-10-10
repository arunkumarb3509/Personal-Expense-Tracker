import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

export default function AddTabPlaceholder() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/add-transaction');
  }, []);

  return <View style={{ flex: 1 }} />;
}
