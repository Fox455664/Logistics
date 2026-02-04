import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Plus, MapPin, Calendar, ArrowLeft, Box } from 'lucide-react-native'; // تأكد من استيراد الأيقونات
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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'open': return { bg: '#DBEAFE', text: '#1E40AF', label: 'مفتوح للعروض' };
      case 'assigned': return { bg: '#FEF3C7', text: '#92400E', label: 'تم الإسناد' };
      case 'in_transit': return { bg: '#D1FAE5', text: '#065F46', label: 'في الطريق' };
      case 'delivered': return { bg: '#DCFCE7', text: '#166534', label: 'تم التسليم' };
      default: return { bg: '#F1F5F9', text: '#475569', label: status };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.actionBar}>
        <View>
          <Text style={styles.screenTitle}>شحناتي</Text>
          <Text style={styles.screenSubtitle}>تتبع وإدارة طلبات الشحن</Text>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Plus color="#FFF" size={24} />
          <Text style={styles.addButtonText}>طلب جديد</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color="#0F172A" />
        </View>
      ) : shipments.length === 0 ? (
        <View style={styles.emptyState}>
          <Box color="#CBD5E1" size={64} />
          <Text style={styles.emptyText}>لا توجد شحنات نشطة</Text>
          <Text style={styles.emptySubtext}>ابدأ بإنشاء طلب شحن جديد</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContainer}>
          {shipments.map((shipment) => {
             const statusStyle = getStatusStyle(shipment.status);
             return (
              <TouchableOpacity key={shipment.id} style={styles.card}>
                
                {/* Header: Status & Price */}
                <View style={styles.cardHeader}>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                      {statusStyle.label}
                    </Text>
                  </View>
                  <Text style={styles.price}>
                    {shipment.budgetAmount.toLocaleString()} <Text style={styles.currency}>ر.س</Text>
                  </Text>
                </View>

                {/* Goods Info */}
                <Text style={styles.goodsTitle}>{shipment.goodsDescription}</Text>
                <View style={styles.specsRow}>
                  <Text style={styles.specItem}>⚖️ {shipment.weightKg} كغ</Text>
                  {shipment.requiredTruckType && <Text style={styles.specItem}>🚛 {shipment.requiredTruckType}</Text>}
                </View>

                <View style={styles.divider} />

                {/* Route Visualization */}
                <View style={styles.routeContainer}>
                  <View style={styles.routePoint}>
                    <View style={[styles.dot, styles.pickupDot]} />
                    <View style={styles.addressBox}>
                      <Text style={styles.addressLabel}>الاستلام</Text>
                      <Text style={styles.addressText}>{shipment.pickupLocation}</Text>
                      <Text style={styles.dateText}>{shipment.pickupDate}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.connectorLine} />

                  <View style={styles.routePoint}>
                    <View style={[styles.dot, styles.deliveryDot]} />
                    <View style={styles.addressBox}>
                      <Text style={styles.addressLabel}>التسليم</Text>
                      <Text style={styles.addressText}>{shipment.deliveryLocation}</Text>
                      <Text style={styles.dateText}>{shipment.deliveryDate}</Text>
                    </View>
                  </View>
                </View>

              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  screenSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  addButton: {
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  centerLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  currency: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  goodsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
    textAlign: 'right',
  },
  specsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    justifyContent: 'flex-end',
  },
  specItem: {
    fontSize: 13,
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  routeContainer: {
    gap: 0,
  },
  routePoint: {
    flexDirection: 'row-reverse', // RTL Layout style
    alignItems: 'flex-start',
    gap: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    backgroundColor: '#FFF',
    marginTop: 4,
    zIndex: 10,
  },
  pickupDot: {
    borderColor: '#0F172A',
  },
  deliveryDot: {
    borderColor: '#F59E0B',
  },
  connectorLine: {
    width: 2,
    height: 24,
    backgroundColor: '#E2E8F0',
    position: 'relative',
    right: 5, // Adjust based on dots layout
    marginVertical: -4,
    marginRight: 11, // For RTL positioning
  },
  addressBox: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    textAlign: 'right',
  },
  addressText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
    textAlign: 'right',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'right',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.7,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#64748B',
    marginTop: 8,
  },
});
