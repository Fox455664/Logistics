import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Plus, AlertCircle } from 'lucide-react-native';
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
      .select(`
        *,
        truck_availability(status)
      `)
      .eq('owner_id', user?.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTrucks(data as TruckWithStatus[]);
    }
    setLoading(false);
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

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'available':
        return '#34c759';
      case 'busy':
        return '#ff9500';
      case 'maintenance':
        return '#f44';
      default:
        return '#999';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'available':
        return 'متاحة';
      case 'busy':
        return 'مشغولة';
      case 'maintenance':
        return 'صيانة';
      default:
        return 'غير معروف';
    }
  };

  const renderTruck = ({ item }: { item: TruckWithStatus }) => {
    const availability = Array.isArray(item.truck_availability) ? item.truck_availability[0] : item.truck_availability;
    return (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerContent}>
          <Text style={styles.truckType}>{getTruckTypeLabel(item.truckType)}</Text>
          <Text style={styles.plateNumber}>{item.plateNumber}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(availability?.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(availability?.status)}</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>السعة:</Text>
          <Text style={styles.value}>{item.capacityKg.toFixed(0)} كغ</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>سنة الصنع:</Text>
          <Text style={styles.value}>{item.yearManufactured}</Text>
        </View>

        {item.capacityM3 && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>الحجم:</Text>
            <Text style={styles.value}>{item.capacityM3.toFixed(1)} م³</Text>
          </View>
        )}

        {!item.documentsVerified && (
          <View style={styles.warningBox}>
            <AlertCircle color="#f44" size={16} />
            <Text style={styles.warningText}>الوثائق غير مُتحقق منها</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.editButton}>
        <Text style={styles.editButtonText}>تحديث الحالة</Text>
      </TouchableOpacity>
    </TouchableOpacity>
    );
  };

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
        <Text style={styles.title}>شاحناتي</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={trucks}
        renderItem={renderTruck}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>لا توجد شاحنات مسجلة</Text>
            <Text style={styles.emptySubtext}>أضف شاحنة جديدة للبدء</Text>
          </View>
        }
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffe8e8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  warningText: {
    fontSize: 12,
    color: '#c33',
    fontWeight: '500',
  },
  editButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
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
    fontWeight: '600',
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});
