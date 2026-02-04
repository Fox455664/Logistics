import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Plus, AlertTriangle, CheckCircle, Clock, Truck as TruckIcon } from 'lucide-react-native';
import { Truck } from '@/types/auth';

interface TruckWithStatus extends Truck {
  truck_availability?: { status: string };
}

export default function MyTrucksScreen() {
  const [trucks, setTrucks] = useState<TruckWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchTrucks();
  }, [user?.id]);

  const fetchTrucks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('trucks')
      .select(`*, truck_availability(status)`)
      .eq('owner_id', user?.id)
      .order('created_at', { ascending: false });

    if (!error && data) setTrucks(data as TruckWithStatus[]);
    setLoading(false);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'available': return { color: '#16A34A', bg: '#DCFCE7', text: 'جاهزة للعمل', icon: <CheckCircle size={14} color="#16A34A" /> };
      case 'busy': return { color: '#D97706', bg: '#FEF3C7', text: 'مشغولة', icon: <Clock size={14} color="#D97706" /> };
      default: return { color: '#DC2626', bg: '#FEE2E2', text: 'صيانة / غير متاحة', icon: <AlertTriangle size={14} color="#DC2626" /> };
    }
  };

  const renderTruck = ({ item }: { item: TruckWithStatus }) => {
    const status = Array.isArray(item.truck_availability) ? item.truck_availability[0]?.status : item.truck_availability?.status;
    const badge = getStatusBadge(status);

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View>
            <Text style={styles.plateNumber}>{item.plateNumber}</Text>
            <Text style={styles.truckType}>{item.truckType.toUpperCase()}</Text>
          </View>
          <TruckIcon size={32} color="#0F172A" strokeWidth={1.5} />
        </View>

        <View style={styles.divider} />

        <View style={styles.specsContainer}>
          <View style={styles.specBox}>
            <Text style={styles.specLabel}>السعة</Text>
            <Text style={styles.specValue}>{item.capacityKg} كغ</Text>
          </View>
          <View style={styles.specBox}>
            <Text style={styles.specLabel}>الموديل</Text>
            <Text style={styles.specValue}>{item.yearManufactured}</Text>
          </View>
          <View style={styles.specBox}>
            <Text style={styles.specLabel}>الحالة</Text>
            <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
              {badge.icon}
              <Text style={[styles.statusText, { color: badge.color }]}>{badge.text}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>تحديث الحالة</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>أسطولي</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus color="#FFF" size={24} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#0F172A" />
      ) : (
        <FlatList
          data={trucks}
          renderItem={renderTruck}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>لم تقم بإضافة شاحنات بعد</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  addButton: {
    backgroundColor: '#0F172A',
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center'
  },
  loader: { marginTop: 50 },
  list: { padding: 16, gap: 16 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  plateNumber: { fontSize: 18, fontWeight: '800', color: '#0F172A', letterSpacing: 1 },
  truckType: { fontSize: 12, color: '#64748B', fontWeight: '600', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  specsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  specBox: { alignItems: 'flex-start' },
  specLabel: { fontSize: 11, color: '#94A3B8', marginBottom: 4 },
  specValue: { fontSize: 14, fontWeight: '700', color: '#334155' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6
  },
  statusText: { fontSize: 12, fontWeight: '700' },
  actionButton: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  actionText: { color: '#0F172A', fontWeight: '600', fontSize: 13 },
  empty: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#64748B', fontSize: 16 },
});
