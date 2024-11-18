import HeaderComponent from '@/components/HeaderComponent';
import { Stack } from 'expo-router';
import React from 'react';

export default function Layout() {
  return <Stack screenOptions={{ header: () => <HeaderComponent /> }} />;
}
