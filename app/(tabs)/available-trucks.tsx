import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Star } from 'lucide-react-native';
import { Truck } from '@/types/auth';

interface TruckWithAvailability extends Truck {
  availability_status: string;
  user_profiles?: { full_name: string; rating: number };
}

export default function AvailableTrucksScreen() {
  const [trucks, setTrucks] = useState<TruckWithAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTrucks();
  }, []);

  const fetchTrucks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('trucks')
      .select(
        `
        *,
        truck_availability:truck_availability(status),
        user_profiles!trucks_owner_id_fkey(full_name, rating)
      `
      )
      .eq('active', true)
      .eq('truck_availability.status', 'available')
      .limit(100);

    if (!error && data) {
      setTrucks(
        data.map((t: any) => ({
          id: t.id,
          ownerId: t.owner_id,
          plateNumber: t.plate_number,
          truckType: t.truck_type,
          capacityKg: t.capacity_kg,
          capacityM3: t.capacity_m3,
          yearManufactured: t.year_manufactured,
          documentsVerified: t.documents_verified,
          insuranceExpiry: t.insurance_expiry,
          locationLat: t.location_lat,
          locationLng: t.location_lng,
          currentCity: t.current_city,
          active: t.active,
          availability_status: t.truck_availability?.[0]?.status,
          user_profiles: t.user_profiles,
        }))
      );
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTrucks();
    setRefreshing(false);
  };

  const getTruckTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      flatbed: 'شحن مفتوح',
      refrigerated: 'تبريد',
      container: 'حاوية',
      tanker: 'خزان',
      pickup: 'بيك أب',
    };
    return types[type] || type;
  };

  const renderTruck = ({ item }: { item: TruckWithAvailability }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerContent}>
          <Text style={styles.truckType}>{getTruckTypeLabel(item.truckType)}</Text>
          <Text style={styles.plateNumber}>{item.plateNumber}</Text>
        </View>
        <View style={styles.ratingBadge}>
          <Star color="#ffc107" size={16} fill="#ffc107" />
          <Text style={styles.rating}>{item.user_profiles?.rating.toFixed(1)}</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>السعة:</Text>
          <Text style={styles.value}>{item.capacityKg.toFixed(0)} كغ</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>المالك:</Text>
          <Text style={styles.value}>{item.user_profiles?.full_name}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>المدينة:</Text>
          <Text style={styles.value}>{item.currentCity}</Text>
        </View>

        {item.capacityM3 && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>الحجم:</Text>
            <Text style={styles.value}>{item.capacityM3.toFixed(1)} م³</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.bidButton}>
        <Text style={styles.bidButtonText}>طلب عرض سعر</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerLoader}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>الشاحنات المتاحة</Text>
        <Text style={styles.subtitle}>{trucks.length} شاحنة</Text>
      </View>

      <FlatList
        data={trucks}
        renderItem={renderTruck}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>لا توجد شاحنات متاحة في الوقت الحالي</Text>
          </View>
        }
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
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
  listContainer: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerContent: {
    flex: 1,
  },
  truckType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  plateNumber: {
    fontSize: 14,
    color: '#0066cc',
    marginTop: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff8e1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  cardContent: {
    gap: 8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 13,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  bidButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  bidButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
