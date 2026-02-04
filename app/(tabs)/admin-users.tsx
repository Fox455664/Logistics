import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckCircle, AlertCircle } from 'lucide-react-native';

interface AdminUser {
  id: string;
  email?: string;
  role: string;
  phoneNumber: string;
  city: string;
  verified: boolean;
}

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        role,
        phone_number,
        city,
        user_profiles(verified)
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error && data) {
      setUsers(
        data.map((u: any) => ({
          id: u.id,
          role: u.role,
          phoneNumber: u.phone_number,
          city: u.city,
          verified: u.user_profiles?.[0]?.verified || false,
        }))
      );
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const getRoleLabel = (role: string) => {
    const roles: { [key: string]: string } = {
      shipper: 'صاحب حمولة',
      driver: 'صاحب شاحنة',
      admin: 'مسؤول',
    };
    return roles[role] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'shipper':
        return '#e3f2fd';
      case 'driver':
        return '#f3e5f5';
      case 'admin':
        return '#fef3c7';
      default:
        return '#f0f0f0';
    }
  };

  const getRoleTextColor = (role: string) => {
    switch (role) {
      case 'shipper':
        return '#0066cc';
      case 'driver':
        return '#7c3aed';
      case 'admin':
        return '#f59e0b';
      default:
        return '#666';
    }
  };

  const renderUser = ({ item }: { item: AdminUser }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.userInfo}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>{item.phoneNumber.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.userDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.phoneNumber}>{item.phoneNumber}</Text>
              <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(item.role) }]}>
                <Text style={[styles.roleLabel, { color: getRoleTextColor(item.role) }]}>
                  {getRoleLabel(item.role)}
                </Text>
              </View>
            </View>
            <Text style={styles.city}>{item.city}</Text>
          </View>
        </View>

        <View style={styles.verificationBox}>
          {item.verified ? (
            <>
              <CheckCircle color="#16a34a" size={20} />
              <Text style={styles.verifiedText}>مُتحقق</Text>
            </>
          ) : (
            <>
              <AlertCircle color="#f59e0b" size={20} />
              <Text style={styles.unverifiedText}>بانتظار التحقق</Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        {!item.verified && (
          <TouchableOpacity style={styles.verifyButton}>
            <Text style={styles.verifyButtonText}>التحقق</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.detailsButton}>
          <Text style={styles.detailsButtonText}>التفاصيل</Text>
        </TouchableOpacity>
      </View>
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
        <Text style={styles.title}>إدارة المستخدمين</Text>
        <Text style={styles.subtitle}>{users.length} مستخدم</Text>
      </View>

      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>لا توجد مستخدمين</Text>
          </View>
        }
        initialNumToRender={10}
        maxToRenderPerBatch={10}
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
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  userDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  roleLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  city: {
    fontSize: 13,
    color: '#666',
  },
  verificationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '600',
  },
  unverifiedText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  verifyButton: {
    flex: 1,
    backgroundColor: '#34c759',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  detailsButton: {
    flex: 1,
    backgroundColor: '#0066cc',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#fff',
    fontSize: 12,
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
