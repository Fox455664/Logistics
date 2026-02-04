import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  // إذا كان المستخدم مسجلاً، اذهب للرئيسية، وإلا اذهب لتسجيل الدخول
  return <Redirect href={session ? "/(tabs)/shipments" : "/auth/login"} />;
}
