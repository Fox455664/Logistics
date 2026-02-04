import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, User } from 'lucide-react-native';

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('users').select('*, user_profiles(verified)').then(({ data }) => {
      if (data) setUsers(data);
      setLoading(false);
    });
  }, []);

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'admin': return { bg: '#F3E8FF', txt: '#7E22CE' };
      case 'shipper': return { bg: '#DBEAFE', txt: '#1E40AF' };
      default: return { bg: '#FEF3C7', txt: '#B45309' };
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const theme = getRoleColor(item.role);
    return (
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTxt}>{item.phone_number?.charAt(0) || 'U'}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.phone}>{item.phone_number}</Text>
          <Text style={styles.city}>{item.city || 'غير محدد'}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: theme.bg }]}>
          <Text style={[styles.badgeTxt, { color: theme.txt }]}>{item.role}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>المستخدمين</Text></View>
      {loading ? <ActivityIndicator size="large" color="#0F172A" style={{marginTop: 50}} /> :
      <FlatList data={users} renderItem={renderItem} contentContainerStyle={styles.list} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#E2E8F0' },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  list: { padding: 16, gap: 10 },
  card: { 
    flexDirection: 'row-reverse', alignItems: 'center', 
    backgroundColor: '#FFF', padding: 12, borderRadius: 10, 
    borderWidth: 1, borderColor: '#E2E8F0' 
  },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  avatarTxt: { fontWeight: '700', color: '#475569' },
  info: { flex: 1 },
  phone: { fontSize: 14, fontWeight: '700', color: '#1E293B', textAlign: 'right' },
  city: { fontSize: 12, color: '#94A3B8', textAlign: 'right' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeTxt: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' }
});
