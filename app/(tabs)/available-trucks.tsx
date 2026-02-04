import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Star, Truck } from 'lucide-react-native';

export default function AvailableTrucksScreen() {
  const [trucks, setTrucks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase.from('trucks')
        .select(`*, user_profiles!trucks_owner_id_fkey(full_name, rating)`)
        .eq('active', true);
      if (data) setTrucks(data);
      setLoading(false);
    };
    load();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.ratingBox}>
          <Star size={14} color="#D97706" fill="#D97706" />
          <Text style={styles.ratingText}>{item.user_profiles?.rating?.toFixed(1) || '5.0'}</Text>
        </View>
        <Text style={styles.owner}>{item.user_profiles?.full_name}</Text>
      </View>
      
      <View style={styles.truckInfo}>
        <Truck size={32} color="#0F172A" />
        <View>
          <Text style={styles.type}>{item.truck_type}</Text>
          <Text style={styles.capacity}>{item.capacity_kg} كغ • {item.current_city}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.btn}>
        <Text style={styles.btnText}>طلب عرض سعر</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.titleBar}>
        <Text style={styles.title}>الشاحنات المتاحة</Text>
      </View>
      {loading ? <ActivityIndicator size="large" color="#0F172A" style={{marginTop: 50}} /> :
      <FlatList 
        data={trucks} 
        renderItem={renderItem} 
        contentContainerStyle={styles.list} 
        ListEmptyComponent={<Text style={styles.empty}>لا توجد شاحنات في منطقتك حالياً</Text>}
      />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  titleBar: { padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#E2E8F0' },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  list: { padding: 16, gap: 12 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', elevation: 1 },
  header: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 12 },
  owner: { fontWeight: '700', color: '#1E293B' },
  ratingBox: { flexDirection: 'row', gap: 4, backgroundColor: '#FEF3C7', padding: 4, borderRadius: 4 },
  ratingText: { fontSize: 12, fontWeight: '700', color: '#D97706' },
  truckInfo: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, marginBottom: 16 },
  type: { fontSize: 16, fontWeight: '700', color: '#0F172A', textAlign: 'right' },
  capacity: { fontSize: 13, color: '#64748B' },
  btn: { backgroundColor: '#0F172A', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 40, color: '#94A3B8' }
});
