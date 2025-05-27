import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, PauseCircle, Clock } from 'lucide-react';
import { useStore } from '../lib/useStore';
import { supabase } from '../lib/supabase';
import Navigation from '../components/Navigation';

const Study: React.FC = () => {
  const { weeklyStudyTime, totalStudyTime, addStudyTime, userId } = useStore();
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);

  // Format seconds into HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  // Format seconds into hours with 1 decimal place
  const formatHours = (seconds: number): string => {
    return (seconds / 3600).toFixed(1);
  };

  const startTimer = () => {
    if (timerRef.current !== null) return;
    
    startTimeRef.current = Date.now() - pausedTimeRef.current * 1000;
    setIsTimerRunning(true);
    
    timerRef.current = window.setInterval(() => {
      if (startTimeRef.current === null) return;
      
      const now = Date.now();
      const diff = Math.floor((now - startTimeRef.current) / 1000);
      setElapsedSeconds(diff);
    }, 1000);
  };

  const pauseTimer = () => {
    if (timerRef.current === null) return;
    
    window.clearInterval(timerRef.current);
    pausedTimeRef.current = elapsedSeconds;
    timerRef.current = null;
    setIsTimerRunning(false);
  };

  const stopTimer = async () => {
    if (timerRef.current === null && elapsedSeconds === 0) return;
    
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Save study time to store and database
    if (elapsedSeconds > 0 && userId) {
      addStudyTime(elapsedSeconds);
      
      try {
        await supabase
          .from('users')
          .update({
            weekly_study_time: weeklyStudyTime + elapsedSeconds,
            total_study_time: totalStudyTime + elapsedSeconds,
            score: Math.floor((weeklyStudyTime + elapsedSeconds) / 60) // Calculate score based on minutes
          })
          .eq('id', userId);
      } catch (error) {
        console.error('Error updating study time:', error);
      }
    }
    
    // Reset timer
    setIsTimerRunning(false);
    setElapsedSeconds(0);
    pausedTimeRef.current = 0;
    startTimeRef.current = null;
  };

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsVisible(false);
        if (isTimerRunning) {
          pauseTimer();
        }
      } else {
        setIsVisible(true);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isTimerRunning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <motion.div 
      className="min-h-screen p-4 pb-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="card mb-6"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-blue-300 ml-2" />
            <h2 className="text-lg font-bold">وقت الدراسة</h2>
          </div>
        </div>
        
        <div className="flex flex-col space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-blue-200">كم ساعة درست هذا الأسبوع؟</span>
            <span className="font-bold">{formatHours(weeklyStudyTime)}h</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-blue-200">كم درست في حياتك؟</span>
            <span className="font-bold">{formatHours(totalStudyTime)}h</span>
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        className="card mb-6 p-6 text-center"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <p className="text-blue-200 mb-6">
          هذه الصفحة مخصصة لتسجيل وقت دراستك وتحفيزك. اضغط على 'ابدأ' لتسجيل الوقت.
        </p>
        
        {isTimerRunning ? (
          <motion.div 
            className="relative mx-auto mb-8"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
            <div className="relative text-5xl font-bold p-6 bg-blue-900 rounded-full border-4 border-blue-500/50">
              {formatTime(elapsedSeconds)}
            </div>
          </motion.div>
        ) : elapsedSeconds > 0 ? (
          <div className="text-5xl font-bold mb-8">
            {formatTime(elapsedSeconds)}
          </div>
        ) : (
          <motion.div
            className="h-48 flex items-center justify-center mb-8"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
          >
            <Clock className="h-24 w-24 text-blue-400" />
          </motion.div>
        )}
        
        {!isVisible && isTimerRunning && (
          <div className="bg-yellow-800/30 text-yellow-200 p-3 rounded-md mb-6">
            تنبيه: تم إيقاف العداد مؤقتًا لأنك غادرت الصفحة.
          </div>
        )}
        
        <div className="flex justify-center space-x-4 space-x-reverse">
          {!isTimerRunning ? (
            <motion.button
              className="btn-primary flex items-center"
              onClick={startTimer}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <PlayCircle className="h-5 w-5 ml-1" />
              ابدأ
            </motion.button>
          ) : (
            <motion.button
              className="btn-secondary flex items-center"
              onClick={pauseTimer}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <PauseCircle className="h-5 w-5 ml-1" />
              إيقاف مؤقت
            </motion.button>
          )}
          
          {(isTimerRunning || elapsedSeconds > 0) && (
            <motion.button
              className="btn-primary bg-red-600 hover:bg-red-700"
              onClick={stopTimer}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              إنهاء
            </motion.button>
          )}
        </div>
      </motion.div>
      
      <Navigation />
      
      {isTimerRunning && (
        <motion.div
          className="fixed inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-blue-400/30"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: Math.random() * 0.5 + 0.5
              }}
              animate={{
                x: [
                  Math.random() * window.innerWidth,
                  Math.random() * window.innerWidth,
                  Math.random() * window.innerWidth
                ],
                y: [
                  Math.random() * window.innerHeight,
                  Math.random() * window.innerHeight,
                  Math.random() * window.innerHeight
                ],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 15 + Math.random() * 10,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Study;