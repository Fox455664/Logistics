import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { User as DBUser } from '@/types/auth';

interface AuthContextType {
  session: Session | null;
  user: DBUser | null;
  loading: boolean;
  signUp: (email: string, password: string, role: 'shipper' | 'driver', phone: string, city: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<DBUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    // جلب الجلسة الحالية عند بدء التطبيق
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user.id) {
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // الاستماع للتغييرات في حالة المصادقة (تسجيل دخول/خروج)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user.id) {
        fetchUserData(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        setUser({
          id: data.id,
          role: data.role,
          phoneNumber: data.phone_number,
          city: data.city,
          createdAt: data.created_at,
        });
      }
    } catch (e) {
      console.error('Error fetching user data:', e);
    } finally {
      setLoading(false);
    }
  };

  // --- دالة التسجيل المعدلة ---
  const signUp = async (email: string, password: string, role: 'shipper' | 'driver', phone: string, city: string) => {
    // نرسل البيانات داخل options.data
    // الـ Trigger في قاعدة البيانات سيقرأ هذه البيانات وينشئ الصف في جدول users
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: role,
          phone_number: phone, // تأكد أن الاسم يطابق ما كتبته في الـ Trigger
          city: city,
          full_name: 'مستخدم جديد' // قيمة افتراضية للاسم، يمكنك تمريرها كبارامتر إذا أردت
        }
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('User creation failed');
    
    // ملاحظة: تم حذف كود supabase.from('users').insert(...) لتجنب خطأ RLS
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    // تنظيف الحالة عند تسجيل الخروج
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
