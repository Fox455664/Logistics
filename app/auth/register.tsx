import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [role, setRole] = useState<'shipper' | 'driver'>('shipper');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password || !phone || !city) {
      setError('الرجاء ملء جميع الحقول');
      return;
    }

    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signUp(email, password, role, phone, city);
      router.replace('/(tabs)');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>إنشاء حساب</Text>
        <Text style={styles.subtitle}>منصة اللوجستيات</Text>
      </View>

      {error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}

      <View style={styles.form}>
        <Text style={styles.label}>نوع الحساب</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={role}
            onValueChange={(value: string) => setRole(value as 'shipper' | 'driver')}
            enabled={!loading}
          >
            <Picker.Item label="صاحب حمولة" value="shipper" />
            <Picker.Item label="صاحب شاحنة" value="driver" />
          </Picker>
        </View>

        <Text style={styles.label}>البريد الإلكتروني</Text>
        <TextInput
          style={styles.input}
          placeholder="your@email.com"
          value={email}
          onChangeText={setEmail}
          editable={!loading}
          keyboardType="email-address"
        />

        <Text style={styles.label}>رقم الهاتف</Text>
        <TextInput
          style={styles.input}
          placeholder="+966501234567"
          value={phone}
          onChangeText={setPhone}
          editable={!loading}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>المدينة</Text>
        <TextInput
          style={styles.input}
          placeholder="الرياض"
          value={city}
          onChangeText={setCity}
          editable={!loading}
        />

        <Text style={styles.label}>كلمة المرور</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>إنشاء حساب</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/auth/login')}>
          <Text style={styles.link}>هل لديك حساب بالفعل؟ <Text style={styles.linkBold}>تسجيل دخول</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  errorBox: {
    backgroundColor: '#fee',
    borderLeftWidth: 4,
    borderLeftColor: '#f44',
    padding: 12,
    borderRadius: 6,
    marginBottom: 20,
  },
  errorText: {
    color: '#c33',
    fontSize: 14,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#0066cc',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
  linkBold: {
    color: '#0066cc',
    fontWeight: '600',
  },
});
