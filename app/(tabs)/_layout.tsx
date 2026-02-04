import { Tabs } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Truck, Package, Settings, BarChart3 } from 'lucide-react-native';
import { Platform } from 'react-native';

export default function TabsLayout() {
  const { user } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 0, // Android shadow remove
          shadowOpacity: 0, // iOS shadow remove
          borderBottomWidth: 1,
          borderBottomColor: '#E2E8F0',
        },
        headerTitleStyle: {
          fontWeight: '700',
          color: '#0F172A',
          fontSize: 18,
        },
        headerTitleAlign: 'center',
        tabBarActiveTintColor: '#0F172A', // اللون النشط كحلي
        tabBarInactiveTintColor: '#94A3B8', // اللون غير النشط رمادي
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 12,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontWeight: '600',
          fontSize: 12,
        },
      }}
    >
      {/* ... نفس محتوى الشاشات السابق بدون تغيير في المنطق ... */}
      {user?.role === 'shipper' && (
        <>
          <Tabs.Screen
            name="shipments"
            options={{
              title: 'إدارة الشحنات',
              tabBarLabel: 'الشحنات',
              tabBarIcon: ({ color, size }) => <Package color={color} size={size} strokeWidth={2} />,
            }}
          />
          <Tabs.Screen
            name="available-trucks"
            options={{
              title: 'الأسطول المتاح',
              tabBarLabel: 'شاحنات',
              tabBarIcon: ({ color, size }) => <Truck color={color} size={size} strokeWidth={2} />,
            }}
          />
        </>
      )}

      {user?.role === 'driver' && (
        <>
          <Tabs.Screen
            name="my-trucks"
            options={{
              title: 'مركباتي',
              tabBarLabel: 'مركباتي',
              tabBarIcon: ({ color, size }) => <Truck color={color} size={size} strokeWidth={2} />,
            }}
          />
          <Tabs.Screen
            name="available-shipments"
            options={{
              title: 'سوق الشحن',
              tabBarLabel: 'السوق',
              tabBarIcon: ({ color, size }) => <Package color={color} size={size} strokeWidth={2} />,
            }}
          />
        </>
      )}

      {user?.role === 'admin' && (
        <>
          <Tabs.Screen
            name="admin-dashboard"
            options={{
              title: 'نظرة عامة',
              tabBarLabel: 'الرئيسية',
              tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} strokeWidth={2} />,
            }}
          />
          <Tabs.Screen
            name="admin-users"
            options={{
              title: 'المستخدمين',
              tabBarLabel: 'الأعضاء',
              tabBarIcon: ({ color, size }) => <Users color={color} size={size} strokeWidth={2} />,
            }}
          />
        </>
      )}

      <Tabs.Screen
        name="profile"
        options={{
          title: 'حسابي',
          tabBarLabel: 'حسابي',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} strokeWidth={2} />,
        }}
      />
    </Tabs>
  );
              }
