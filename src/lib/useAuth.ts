import { useEffect } from 'react';
import { supabase } from './supabase';
import { useStore } from './useStore';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const { 
    telegramUser, 
    setTelegramUser, 
    setUserId, 
    wilaya, 
    setWilaya,
    setScore,
    setWeeklyStudyTime,
    setTotalStudyTime,
    isInitialized,
    setIsInitialized
  } = useStore();
  const navigate = useNavigate();

  // Initialize Telegram user data
  useEffect(() => {
    if (window.Telegram?.WebApp && !telegramUser) {
      try {
        const webAppData = window.Telegram.WebApp.initDataUnsafe;
        if (webAppData?.user) {
          setTelegramUser(webAppData.user);
        } else {
          // Fallback for development
          console.warn('No Telegram WebApp user data available, using mock data');
          setTelegramUser({
            id: 12345678,
            first_name: 'Test',
            last_name: 'User',
            username: 'testuser',
            photo_url: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
            auth_date: Math.floor(Date.now() / 1000),
            hash: 'mockhash'
          });
        }
      } catch (error) {
        console.error('Error initializing Telegram WebApp data', error);
      }
    }
  }, [setTelegramUser, telegramUser]);

  // Check if user exists in the database
  useEffect(() => {
    const checkUser = async () => {
      if (telegramUser && !isInitialized) {
        try {
          // Check if user exists
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('telegram_id', telegramUser.id.toString())
            .single();

          if (userError && userError.code !== 'PGRST116') {
            console.error('Error fetching user data:', userError);
            return;
          }

          if (userData) {
            // User exists, update state
            setUserId(userData.id);
            setWilaya(userData.wilaya);
            setScore(userData.score);
            setWeeklyStudyTime(userData.weekly_study_time);
            setTotalStudyTime(userData.total_study_time);
            setIsInitialized(true);
          } else {
            // User doesn't exist, navigate to wilaya selection
            setIsInitialized(true);
            navigate('/select-wilaya');
            return;
          }
        } catch (error) {
          console.error('Error in auth check:', error);
        }
      }
    };

    checkUser();
  }, [telegramUser, isInitialized, setUserId, setWilaya, setScore, setWeeklyStudyTime, setTotalStudyTime, setIsInitialized, navigate]);

  // Check if we need to redirect based on wilaya
  useEffect(() => {
    if (isInitialized) {
      if (!wilaya) {
        navigate('/select-wilaya');
      }
    }
  }, [wilaya, isInitialized, navigate]);

  return { telegramUser, isInitialized };
};