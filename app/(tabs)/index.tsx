import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { View, ActivityIndicator, Text } from 'react-native';

export default function TabIndex() {
  const { user, loading } = useAuth();

  // 1. إذا كان التطبيق لا يزال يحمل البيانات، اظهر دائرة تحميل
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  // 2. إذا لم يتم التعرف على المستخدم لسبب ما، وجهه للملف الشخصي
  if (!user) {
    return <Redirect href="/(tabs)/profile" />;
  }

  // 3. التوجيه حسب نوع المستخدم (Role)
  if (user.role === 'shipper') {
    return <Redirect href="/(tabs)/shipments" />;
  }

  if (user.role === 'driver') {
    return <Redirect href="/(tabs)/my-trucks" />;
  }

  if (user.role === 'admin') {
    return <Redirect href="/(tabs)/admin-dashboard" />;
  }

  // 4. حالة افتراضية
  return <Redirect href="/(tabs)/profile" />;
}
