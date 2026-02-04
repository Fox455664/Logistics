import { Tabs } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
// تأكد من استيراد الأيقونات من المكتبة الصحيحة
import { Truck, Package, Settings, BarChart3, Users } from 'lucide-react-native';
import { Platform, View } from 'react-native';

export default function TabsLayout() {
  const { user } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#E2E8F0',
        },
        headerTitleStyle: {
          fontWeight: '800',
          color: '#0F172A',
          fontSize: 20,
          fontFamily: Platform.OS === 'web' ? 'System' : undefined, // تحسين الخط
        },
        headerTitleAlign: 'center',
        tabBarActiveTintColor: '#F59E0B', // اللون الذهبي عند التفعيل
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 30 : 12,
          paddingTop: 12,
        },
        tabBarLabelStyle: {
          fontWeight: '700',
          fontSize: 12,
          marginTop: 4,
        },
      }}
    >
      {/* شاشات صاحب البضاعة */}
      {user?.role === 'shipper' && (
        <>
          <Tabs.Screen
            name="shipments"
            options={{
              title: 'إدارة الشحنات',
              tabBarLabel: 'شحناتي',
              tabBarIcon: ({ color, size }) => <Package color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="available-trucks"
            options={{
              title: 'الأسطول المتاح',
              tabBarLabel: 'شاحنات',
              tabBarIcon: ({ color, size }) => <Truck color={color} size={size} />,
            }}
          />
        </>
      )}

      {/* شاشات السائق */}
      {user?.role === 'driver' && (
        <>
          <Tabs.Screen
            name="my-trucks"
            options={{
              title: 'مركباتي',
              tabBarLabel: 'مركباتي',
              tabBarIcon: ({ color, size }) => <Truck color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="available-shipments"
            options={{
              title: 'سوق الشحن',
              tabBarLabel: 'السوق',
              tabBarIcon: ({ color, size }) => <Package color={color} size={size} />,
            }}
          />
        </>
      )}

      {/* شاشات الأدمن */}
      {user?.role === 'admin' && (
        <>
          <Tabs.Screen
            name="admin-dashboard"
            options={{
              title: 'لوحة التحكم',
              tabBarLabel: 'الرئيسية',
              tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="admin-users"
            options={{
              title: 'المستخدمين',
              tabBarLabel: 'الأعضاء',
              tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
            }}
          />
        </>
      )}

      {/* الملف الشخصي (للجميع) */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'الملف الشخصي',
          tabBarLabel: 'حسابي',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />

      {/* إخفاء الصفحات التي لا يجب أن تظهر في التبويبات */}
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}
