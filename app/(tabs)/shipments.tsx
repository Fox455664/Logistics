import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Plus } from 'lucide-react-native';
import { ShipmentRequest } from '@/types/auth';

export default function ShipmentsScreen() {
  const [shipments, setShipments] = useState<ShipmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchShipments();
  }, [user?.id]);

  const fetchShipments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('shipment_requests')
      .select('*')
      .eq('shipper_id', user?.id)
      .order('created_at', { ascending: false });

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return '#0066cc';
      case 'assigned':
        return '#ff9500';
      case 'in_transit':
        return '#34c759';
      case 'delivered':
        return '#05a745';
      default:
        return '#999';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'مفتوح';
      case 'assigned':
        return 'مُسند';
      case 'in_transit':
        return 'في الطريق';
      case 'delivered':
        return 'تم التسليم';
      case 'cancelled':
        return 'ملغى';
      default:
        return status;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>شحناتي</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color="#0066cc" />
        </View>
      ) : shipments.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>لا توجد شحنات بعد</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContainer}>
          {shipments.map((shipment) => (
            <TouchableOpacity key={shipment.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{shipment.goodsDescription}</Text>
                <View style={[styles.badge, { backgroundColor: getStatusColor(shipment.status) }]}>
                  <Text style={styles.badgeText}>{getStatusLabel(shipment.status)}</Text>
                </View>
              </View>

              <View style={styles.cardContent}>
                <View style={styles.route}>
                  <Text style={styles.location}>{shipment.pickupLocation}</Text>
                  <Text style={styles.separator}>→</Text>
                  <Text style={styles.location}>{shipment.deliveryLocation}</Text>
                </View>

                <View style={styles.details}>
                  <Text style={styles.detail}>الوزن: {shipment.weightKg} كغ</Text>
                  <Text style={styles.detail}>الميزانية: {shipment.budgetAmount.toFixed(2)} ر.س</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    backgroundColor: '#0066cc',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    gap: 12,
  },
  route: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  location: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  separator: {
    fontSize: 16,
    color: '#0066cc',
    marginHorizontal: 4,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detail: {
    fontSize: 13,
    color: '#999',
  },
});
