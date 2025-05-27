import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/useStore';

const wilayas = [
  'أدرار', 'الشلف', 'الأغواط', 'أم البواقي', 'باتنة', 'بجاية', 'بسكرة', 'بشار', 'البليدة', 'البويرة',
  'تمنراست', 'تبسة', 'تلمسان', 'تيارت', 'تيزي وزو', 'الجزائر', 'الجلفة', 'جيجل', 'سطيف', 'سعيدة',
  'سكيكدة', 'سيدي بلعباس', 'عنابة', 'قالمة', 'قسنطينة', 'المدية', 'مستغانم', 'المسيلة', 'معسكر', 'ورقلة',
  'وهران', 'البيض', 'إليزي', 'برج بوعريريج', 'بومرداس', 'الطارف', 'تندوف', 'تيسمسيلت', 'الوادي', 'خنشلة',
  'سوق أهراس', 'تيبازة', 'ميلة', 'عين الدفلى', 'النعامة', 'عين تموشنت', 'غرداية', 'غليزان', 'المغير', 
  'المنيعة', 'أولاد جلال', 'برج باجي مختار', 'بني عباس', 'تيميمون', 'تقرت', 'جانت', 'عين صالح', 'عين قزام'
].sort();

const SelectWilaya: React.FC = () => {
  const [selectedWilaya, setSelectedWilaya] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { telegramUser, setWilaya, setUserId } = useStore();
  
  const handleConfirm = async () => {
    if (!selectedWilaya) {
      setError('الرجاء اختيار الولاية أولاً');
      return;
    }
    
    if (!telegramUser) {
      setError('خطأ في بيانات المستخدم');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Insert new user
      const { data, error: insertError } = await supabase
        .from('users')
        .insert({
          telegram_id: telegramUser.id.toString(),
          username: telegramUser.username || `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim(),
          wilaya: selectedWilaya,
          score: 0,
          weekly_study_time: 0,
          total_study_time: 0
        })
        .select();
      
      if (insertError) throw insertError;
      
      if (data && data[0]) {
        setUserId(data[0].id);
        setWilaya(selectedWilaya);
        navigate('/home');
      }
    } catch (err) {
      console.error('Error creating user:', err);
      setError('حدث خطأ في حفظ البيانات. الرجاء المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <motion.div 
      className="min-h-screen flex flex-col items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="card max-w-md w-full mx-auto"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <MapPin className="h-16 w-16 mx-auto text-blue-400 mb-4" />
          </motion.div>
          <h1 className="text-2xl font-bold mb-2">مرحباً بك في تطبيق الطالب المجتهد!</h1>
          <p className="text-xl text-blue-200">رجاءً اختر ولايتك</p>
        </div>
        
        <div className="mb-6">
          <select
            value={selectedWilaya}
            onChange={(e) => setSelectedWilaya(e.target.value)}
            className="dropdown w-full"
            disabled={isLoading}
          >
            <option value="">-- اختر الولاية --</option>
            {wilayas.map((wilaya) => (
              <option key={wilaya} value={wilaya}>
                {wilaya}
              </option>
            ))}
          </select>
          {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
        </div>
        
        <button
          onClick={handleConfirm}
          className="btn-primary w-full"
          disabled={isLoading}
        >
          {isLoading ? 'جاري الحفظ...' : 'تأكيد الاختيار'}
        </button>
      </motion.div>
    </motion.div>
  );
};

export default SelectWilaya;