import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { MapPin, Box, ArrowRight } from 'lucide-react-native';
import { ShipmentRequest } from '@/types/auth';

export default function AvailableShipmentsScreen() {
  const [shipments, setShipments] = useState<ShipmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchShipments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('shipment_requests')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setShipments(data.map((s: any) => ({
          id: s.id,
          shipperId: s.shipper_id,
          pickupLocation: s.pickup_location,
          deliveryLocation: s.delivery_location,
          goodsDescription: s.goods_description,
          weightKg: s.weight_kg,
          volumeM3: s.volume_m3,
          requiredTruckType: s.required_truck_type,
          budgetAmount: s.budget_amount,
          pickupDate: s.pickup_date,
          deliveryDate: s.delivery_date,
          status: s.status,
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchShipments(); }, []);

  const renderShipment = ({ item }: { item: ShipmentRequest }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.budget}>{item.budgetAmount} <Text style={styles.currency}>ر.س</Text></Text>
          <Text style={styles.weight}>{item.weightKg} كغ • {item.requiredTruckType || 'عام'}</Text>
        </View>
        <TouchableOpacity style={styles.bidBtn}>
          <Text style={styles.bidText}>تقديم عرض</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <Text style={styles.goods}>{item.goodsDescription}</Text>

      <View style={styles.routeContainer}>
        <View style={styles.routeRow}>
          <View style={[styles.dot, styles.greenDot]} />
          <Text style={styles.location} numberOfLines={1}>{item.pickupLocation}</Text>
        </View>
        <View style={styles.line} />
        <View style={styles.routeRow}>
          <View style={[styles.dot, styles.redDot]} />
          <Text style={styles.location} numberOfLines={1}>{item.deliveryLocation}</Text>
        </View>
      </View>
      
      <Text style={styles.date}>📅 {item.pickupDate}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>سوق الشحن</Text>
        <Text style={styles.subTitle}>فرص جديدة بانتظارك</Text>
      </View>
      
      {loading ? (
        <ActivityIndicator style={{marginTop: 40}} size="large" color="#0F172A" />
      ) : (
        <FlatList
          data={shipments}
          renderItem={renderShipment}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={fetchShipments}
          ListEmptyComponent={
             <View style={styles.empty}><Text style={styles.emptyText}>لا توجد شحنات متاحة حالياً</Text></View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  screenTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A' },
  subTitle: { fontSize: 13, color: '#64748B', marginTop: 4 },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#FFF', borderRadius: 12, padding: 20,
    borderWidth: 1, borderColor: '#E2E8F0',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: {width:0, height:2}
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  budget: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  currency: { fontSize: 12, fontWeight: '500', color: '#64748B' },
  weight: { fontSize: 12, color: '#64748B', marginTop: 2 },
  bidBtn: { backgroundColor: '#F59E0B', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  bidText: { color: '#0F172A', fontWeight: '700', fontSize: 12 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  goods: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 12, textAlign: 'right' },
  routeContainer: { gap: 0 },
  routeRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  location: { fontSize: 14, color: '#334155', flex: 1, textAlign: 'right' },
  dot: { width: 10, height: 10, borderRadius: 5 },
  greenDot: { backgroundColor: '#10B981' },
  redDot: { backgroundColor: '#EF4444' },
  line: { width: 2, height: 14, backgroundColor: '#E2E8F0', marginRight: 4, marginVertical: 2 }, // Adjusted for RTL
  date: { fontSize: 12, color: '#94A3B8', marginTop: 12, textAlign: 'right' },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#64748B', fontWeight: '600' }
});
