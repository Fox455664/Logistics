import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { MapPin, Package } from 'lucide-react-native';
import { ShipmentRequest } from '@/types/auth';

export default function AvailableShipmentsScreen() {
  const [shipments, setShipments] = useState<ShipmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('shipment_requests')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error && data) {
      setShipments(
        data.map((s) => ({
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
          specialRequirements: s.special_requirements,
        }))
      );
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchShipments();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA');
  };

  const renderShipment = ({ item }: { item: ShipmentRequest }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerContent}>
          <Text style={styles.title} numberOfLines={2}>{item.goodsDescription}</Text>
          <View style={styles.dates}>
            <Text style={styles.dateText}>{formatDate(item.pickupDate)} - {formatDate(item.deliveryDate)}</Text>
          </View>
        </View>
        <View style={styles.budgetBadge}>
          <Text style={styles.budget}>{item.budgetAmount.toFixed(0)}</Text>
          <Text style={styles.currency}>ر.س</Text>
        </View>
      </View>

      <View style={styles.routeSection}>
        <View style={styles.routeItem}>
          <MapPin color="#34c759" size={18} />
          <Text style={styles.routeText} numberOfLines={2}>{item.pickupLocation}</Text>
        </View>
        <View style={styles.routeDivider} />
        <View style={styles.routeItem}>
          <MapPin color="#f44" size={18} />
          <Text style={styles.routeText} numberOfLines={2}>{item.deliveryLocation}</Text>
        </View>
      </View>

      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>الوزن</Text>
          <Text style={styles.detailValue}>{item.weightKg.toFixed(0)} كغ</Text>
        </View>
        {item.volumeM3 && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>الحجم</Text>
            <Text style={styles.detailValue}>{item.volumeM3.toFixed(1)} م³</Text>
          </View>
        )}
        {item.requiredTruckType && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>نوع الشاحنة</Text>
            <Text style={styles.detailValue}>{item.requiredTruckType}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.bidButton}>
        <Text style={styles.bidButtonText}>قدّم عرض</Text>
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
        <Text style={styles.headerTitle}>شحنات متاحة</Text>
        <Text style={styles.headerSubtitle}>{shipments.length} شحنة</Text>
      </View>

      <FlatList
        data={shipments}
        renderItem={renderShipment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Package color="#999" size={48} />
            <Text style={styles.emptyText}>لا توجد شحنات متاحة الآن</Text>
            <Text style={styles.emptySubtext}>حاول لاحقاً</Text>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerSubtitle: {
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
    marginBottom: 16,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  dates: {
    marginTop: 6,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  budgetBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  budget: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  currency: {
    fontSize: 12,
    color: '#666',
  },
  routeSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 12,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 12,
  },
  routeText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
  },
  routeDivider: {
    height: 8,
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  bidButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  bidButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});
