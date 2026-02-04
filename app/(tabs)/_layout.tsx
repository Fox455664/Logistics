import { Tabs } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
// هنستخدم FontAwesome و MaterialIcons لأنهم مضمونين وشكلهم شيك
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
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
          fontFamily: Platform.OS === 'web' ? 'System' : undefined,
        },
        headerTitleAlign: 'center',
        tabBarActiveTintColor: '#F59E0B', // اللون الذهبي عند التفعيل
        tabBarInactiveTintColor: '#94A3B8', // لون رمادي لما يكون مش نشط
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          height: Platform.OS === 'ios' ? 95 : 70, // زودنا الارتفاع عشان الشكل يبقى مريح
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10,
          elevation: 8, // ضل خفيف
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontWeight: '700',
          fontSize: 11, // صغرنا الخط سنة عشان يبقى أشيك
          marginTop: 2,
        },
      }}
    >
      {/* -------------------- شاشات صاحب البضاعة (Shipper) -------------------- */}
      {user?.role === 'shipper' && (
        <>
          <Tabs.Screen
            name="shipments"
            options={{
              title: 'إدارة الشحنات',
              tabBarLabel: 'شحناتي',
              // أيقونة صندوق
              tabBarIcon: ({ color, size }) => (
                <FontAwesome5 name="box-open" size={20} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="available-trucks"
            options={{
              title: 'الأسطول المتاح',
              tabBarLabel: 'شاحنات',
              // أيقونة شاحنة
              tabBarIcon: ({ color, size }) => (
                <FontAwesome5 name="truck" size={20} color={color} />
              ),
            }}
          />
        </>
      )}

      {/* -------------------- شاشات السائق (Driver) -------------------- */}
      {user?.role === 'driver' && (
        <>
          <Tabs.Screen
            name="my-trucks"
            options={{
              title: 'مركباتي',
              tabBarLabel: 'مركباتي',
              // أيقونة شاحنة نقل
              tabBarIcon: ({ color, size }) => (
                <FontAwesome5 name="truck-moving" size={20} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="available-shipments"
            options={{
              title: 'سوق الشحن',
              tabBarLabel: 'السوق',
              // أيقونة كرة أرضية للسوق
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="earth" size={24} color={color} />
              ),
            }}
          />
        </>
      )}

      {/* -------------------- شاشات الأدمن (Admin) -------------------- */}
      {user?.role === 'admin' && (
        <>
          <Tabs.Screen
            name="admin-dashboard"
            options={{
              title: 'لوحة التحكم',
              tabBarLabel: 'الرئيسية',
              // أيقونة رسم بياني
              tabBarIcon: ({ color, size }) => (
                <MaterialIcons name="dashboard" size={24} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="admin-users"
            options={{
              title: 'المستخدمين',
              tabBarLabel: 'الأعضاء',
              // أيقونة مستخدمين
              tabBarIcon: ({ color, size }) => (
                <FontAwesome5 name="users" size={20} color={color} />
              ),
            }}
          />
        </>
      )}

      {/* -------------------- الملف الشخصي (مشترك) -------------------- */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'الملف الشخصي',
          tabBarLabel: 'حسابي',
          // أيقونة شخص
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="user-alt" size={20} color={color} />
          ),
        }}
      />

      {/* إخفاء الصفحات الفرعية من الشريط السفلي */}
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}
