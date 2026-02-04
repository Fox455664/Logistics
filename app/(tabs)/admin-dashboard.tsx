import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Truck, Package, TrendingUp, AlertCircle } from 'lucide-react-native';

interface DashboardStats {
  totalUsers: number;
  totalTrucks: number;
  totalShipments: number;
  completedShipments: number;
}

export default function AdminDashboardScreen() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalTrucks: 0,
    totalShipments: 0,
    completedShipments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    // ... (نفس كود جلب البيانات السابق) ...
    const [usersRes, trucksRes, shipmentsRes] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('trucks').select('*', { count: 'exact', head: true }),
      supabase.from('shipment_requests').select('*', { count: 'exact', head: true }),
    ]);

    const completedRes = await supabase
      .from('shipment_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'delivered');

    setStats({
      totalUsers: usersRes.count || 0,
      totalTrucks: trucksRes.count || 0,
      totalShipments: shipmentsRes.count || 0,
      completedShipments: completedRes.count || 0,
    });

    setLoading(false);
  };

  const StatCard = ({ title, value, icon, color, bg }: any) => (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <View style={[styles.iconContainer, { backgroundColor: bg }]}>
          {icon}
        </View>
        {/* ممكن إضافة نسبة مئوية هنا مستقبلاً */}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerLoader}>
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.welcomeBanner}>
        <Text style={styles.welcomeTitle}>نظرة عامة على النظام</Text>
        <Text style={styles.welcomeSubtitle}>متابعة الأداء والإحصائيات الحية</Text>
      </View>

      <View style={styles.grid}>
        <StatCard 
          title="إجمالي المستخدمين" 
          value={stats.totalUsers} 
          icon={<Users size={24} color="#0F172A" />} 
          bg="#E2E8F0"
        />
        <StatCard 
          title="أسطول الشاحنات" 
          value={stats.totalTrucks} 
          icon={<Truck size={24} color="#0F172A" />} 
          bg="#E2E8F0"
        />
        <StatCard 
          title="طلبات الشحن" 
          value={stats.totalShipments} 
          icon={<Package size={24} color="#F59E0B" />} 
          bg="#FEF3C7"
        />
        <StatCard 
          title="شحنات مكتملة" 
          value={stats.completedShipments} 
          icon={<TrendingUp size={24} color="#16A34A" />} 
          bg="#DCFCE7"
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>تنبيهات النظام</Text>
      </View>

      <View style={styles.alertCard}>
        <AlertCircle color="#3B82F6" size={24} />
        <View style={styles.alertContent}>
          <Text style={styles.alertTitle}>تحديث الحالة</Text>
          <Text style={styles.alertMessage}>جميع الأنظمة تعمل بكفاءة عالية. لا توجد بلاغات معلقة.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  centerLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeBanner: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    width: '48%', // تقريباً نصف الشاشة
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
    // خفيف جداً
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    padding: 10,
    borderRadius: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  alertCard: {
    flexDirection: 'row-reverse',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    alignItems: 'center',
    gap: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 2,
    textAlign: 'right',
  },
  alertMessage: {
    fontSize: 13,
    color: '#334155',
    textAlign: 'right',
    lineHeight: 20,
  },
});
