import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { LogOut, User, MapPin, Phone, Briefcase } from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const InfoRow = ({ icon, label, value }: any) => (
    <View style={styles.row}>
      <View style={styles.iconBox}>{icon}</View>
      <View style={styles.infoContent}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value || 'غير محدد'}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.phoneNumber?.charAt(0) || 'U'}</Text>
        </View>
        <Text style={styles.name}>مستخدم {user?.role === 'shipper' ? 'أعمال' : 'نقل'}</Text>
        <Text style={styles.roleBadge}>
          {user?.role === 'shipper' ? 'صاحب بضائع' : user?.role === 'driver' ? 'سائق شاحنة' : 'مسؤول'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>بيانات الحساب</Text>
        <View style={styles.card}>
          <InfoRow 
            icon={<Phone size={20} color="#64748B" />} 
            label="رقم الهاتف" 
            value={user?.phoneNumber} 
          />
          <View style={styles.divider} />
          <InfoRow 
            icon={<MapPin size={20} color="#64748B" />} 
            label="المدينة" 
            value={user?.city} 
          />
          <View style={styles.divider} />
          <InfoRow 
            icon={<Briefcase size={20} color="#64748B" />} 
            label="نوع الحساب" 
            value={user?.role?.toUpperCase()} 
          />
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <LogOut color="#EF4444" size={20} />
        <Text style={styles.logoutText}>تسجيل الخروج</Text>
      </TouchableOpacity>
      
      <Text style={styles.version}> الإصدار 1.0.0 • Logistics Corp</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F8FAFC', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#0F172A',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    borderWidth: 4, borderColor: '#E2E8F0'
  },
  avatarText: { color: '#F59E0B', fontSize: 32, fontWeight: 'bold' },
  name: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  roleBadge: {
    marginTop: 6, backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 20, color: '#92400E', fontSize: 12, fontWeight: '700'
  },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#94A3B8', marginBottom: 8, textAlign: 'right' },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  row: { flexDirection: 'row-reverse', alignItems: 'center', paddingVertical: 8 },
  iconBox: { width: 32, alignItems: 'center' },
  infoContent: { flex: 1, marginRight: 12 },
  label: { fontSize: 11, color: '#94A3B8', textAlign: 'right' },
  value: { fontSize: 15, fontWeight: '600', color: '#1E293B', textAlign: 'right' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 8 },
  logoutBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
    backgroundColor: '#FEF2F2', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#FECACA'
  },
  logoutText: { color: '#EF4444', fontWeight: '700', fontSize: 15 },
  version: { textAlign: 'center', color: '#CBD5E1', fontSize: 12, marginTop: 32 }
});
