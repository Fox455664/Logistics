import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Truck, Package, TrendingUp } from 'lucide-react-native';

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

  if (loading) {
    return (
      <View style={styles.centerLoader}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>لوحة التحكم</Text>
        <Text style={styles.subtitle}>نظرة عامة على النظام</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.iconBox, { backgroundColor: '#e3f2fd' }]}>
            <Users color="#0066cc" size={32} />
          </View>
          <Text style={styles.statValue}>{stats.totalUsers}</Text>
          <Text style={styles.statLabel}>مستخدمين</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.iconBox, { backgroundColor: '#f3e5f5' }]}>
            <Truck color="#7c3aed" size={32} />
          </View>
          <Text style={styles.statValue}>{stats.totalTrucks}</Text>
          <Text style={styles.statLabel}>شاحنات</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.iconBox, { backgroundColor: '#fef3c7' }]}>
            <Package color="#f59e0b" size={32} />
          </View>
          <Text style={styles.statValue}>{stats.totalShipments}</Text>
          <Text style={styles.statLabel}>شحنات</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.iconBox, { backgroundColor: '#dcfce7' }]}>
            <TrendingUp color="#16a34a" size={32} />
          </View>
          <Text style={styles.statValue}>{stats.completedShipments}</Text>
          <Text style={styles.statLabel}>مكتملة</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>الأنشطة الأخيرة</Text>
        <View style={styles.activityCard}>
          <Text style={styles.activityText}>تحديث النظام قيد الانتظار</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  centerLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0066cc',
  },
  activityText: {
    color: '#666',
    fontSize: 14,
  },
});
