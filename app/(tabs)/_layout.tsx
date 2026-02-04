import { Tabs } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Truck, Package, Settings, BarChart3 } from 'lucide-react-native';

export default function TabsLayout() {
  const { user } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0066cc',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          paddingBottom: 8,
          height: 60,
        },
      }}
    >
      {user?.role === 'shipper' && (
        <>
          <Tabs.Screen
            name="shipments"
            options={{
              title: 'الشحنات',
              tabBarIcon: ({ color, size }) => <Package color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="available-trucks"
            options={{
              title: 'الشاحنات',
              tabBarIcon: ({ color, size }) => <Truck color={color} size={size} />,
            }}
          />
        </>
      )}

      {user?.role === 'driver' && (
        <>
          <Tabs.Screen
            name="my-trucks"
            options={{
              title: 'شاحناتي',
              tabBarIcon: ({ color, size }) => <Truck color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="available-shipments"
            options={{
              title: 'الشحنات',
              tabBarIcon: ({ color, size }) => <Package color={color} size={size} />,
            }}
          />
        </>
      )}

      {user?.role === 'admin' && (
        <>
          <Tabs.Screen
            name="admin-dashboard"
            options={{
              title: 'لوحة التحكم',
              tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="admin-users"
            options={{
              title: 'المستخدمين',
              tabBarIcon: ({ color, size }) => <Package color={color} size={size} />,
            }}
          />
        </>
      )}

      <Tabs.Screen
        name="profile"
        options={{
          title: 'الملف الشخصي',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
