import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Edit, Trophy, Users } from 'lucide-react';
import { useStore } from '../lib/useStore';
import { supabase } from '../lib/supabase';
import Navigation from '../components/Navigation';

interface Ranking {
  username: string;
  score: number;
  position: number;
  isCurrentUser: boolean;
}

const Home: React.FC = () => {
  const { telegramUser, wilaya, score, userId } = useStore();
  const navigate = useNavigate();
  const [showGlobalRanking, setShowGlobalRanking] = useState<boolean>(false);
  const [showWilayaRanking, setShowWilayaRanking] = useState<boolean>(false);
  const [globalRankings, setGlobalRankings] = useState<Ranking[]>([]);
  const [wilayaRankings, setWilayaRankings] = useState<Ranking[]>([]);
  const [userGlobalRank, setUserGlobalRank] = useState<Ranking | null>(null);
  const [userWilayaRank, setUserWilayaRank] = useState<Ranking | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (showGlobalRanking) {
      fetchGlobalRankings();
    }
  }, [showGlobalRanking]);

  useEffect(() => {
    if (showWilayaRanking && wilaya) {
      fetchWilayaRankings();
    }
  }, [showWilayaRanking, wilaya]);

  const fetchGlobalRankings = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      // Get top 10 users globally
      const { data: topUsers } = await supabase
        .from('users')
        .select('id, username, score')
        .order('score', { ascending: false })
        .limit(10);
      
      // Get current user's rank
      const { data: allUsers } = await supabase
        .from('users')
        .select('id, username, score')
        .order('score', { ascending: false });
      
      if (topUsers && allUsers) {
        // Map top users
        const rankings = topUsers.map((user, index) => ({
          username: user.username,
          score: user.score,
          position: index + 1,
          isCurrentUser: user.id === userId
        }));
        
        setGlobalRankings(rankings);
        
        // Find current user's position if not in top 10
        if (!rankings.some(r => r.isCurrentUser)) {
          const userPosition = allUsers.findIndex(u => u.id === userId) + 1;
          const userInfo = allUsers.find(u => u.id === userId);
          
          if (userInfo && userPosition > 10) {
            setUserGlobalRank({
              username: userInfo.username,
              score: userInfo.score,
              position: userPosition,
              isCurrentUser: true
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching global rankings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWilayaRankings = async () => {
    if (!userId || !wilaya) return;
    
    setIsLoading(true);
    try {
      // Get top 10 users in the same wilaya
      const { data: topWilayaUsers } = await supabase
        .from('users')
        .select('id, username, score')
        .eq('wilaya', wilaya)
        .order('score', { ascending: false })
        .limit(10);
      
      // Get all users in the same wilaya for ranking
      const { data: allWilayaUsers } = await supabase
        .from('users')
        .select('id, username, score')
        .eq('wilaya', wilaya)
        .order('score', { ascending: false });
      
      if (topWilayaUsers && allWilayaUsers) {
        // Map top users in wilaya
        const rankings = topWilayaUsers.map((user, index) => ({
          username: user.username,
          score: user.score,
          position: index + 1,
          isCurrentUser: user.id === userId
        }));
        
        setWilayaRankings(rankings);
        
        // Find current user's position if not in top 10
        if (!rankings.some(r => r.isCurrentUser)) {
          const userPosition = allWilayaUsers.findIndex(u => u.id === userId) + 1;
          const userInfo = allWilayaUsers.find(u => u.id === userId);
          
          if (userInfo && userPosition > 10) {
            setUserWilayaRank({
              username: userInfo.username,
              score: userInfo.score,
              position: userPosition,
              isCurrentUser: true
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching wilaya rankings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditWilaya = () => {
    navigate('/select-wilaya');
  };

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
        <div className="flex items-center">
          <div className="relative">
            <img 
              src={telegramUser?.photo_url || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
              alt="الصورة الشخصية" 
              className="w-16 h-16 rounded-full border-2 border-blue-400"
            />
            <motion.div 
              className="absolute -top-1 -right-1 bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
            >
              {Math.floor(score / 100)}
            </motion.div>
          </div>
          
          <div className="mr-4 flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {telegramUser?.username || `${telegramUser?.first_name} ${telegramUser?.last_name || ''}`.trim()}
              </h2>
              <button 
                onClick={handleEditWilaya} 
                className="text-blue-300 hover:text-blue-100 flex items-center text-sm"
              >
                <Edit className="h-4 w-4 ml-1" />
                تعديل الولاية
              </button>
            </div>
            <div className="flex items-center mt-1">
              <MapPin className="h-4 w-4 text-blue-300 ml-1" />
              <span className="text-sm text-blue-200">{wilaya}</span>
            </div>
            <div className="mt-2">
              <span className="text-sm text-blue-200">النقاط: </span>
              <span className="font-bold">{score}</span>
            </div>
          </div>
        </div>
      </motion.div>
      
      <div className="grid grid-cols-1 gap-4 mb-4">
        <motion.button
          className="card py-3 flex items-center justify-between"
          onClick={() => setShowGlobalRanking(!showGlobalRanking)}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center">
            <Trophy className="h-8 w-8 text-yellow-400 ml-3" />
            <span className="text-lg">الترتيب الدولي</span>
          </div>
          <span className="text-blue-300">{showGlobalRanking ? '▲' : '▼'}</span>
        </motion.button>
        
        {showGlobalRanking && (
          <motion.div
            className="card p-4"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-bold mb-4 text-center">أفضل 10 طلاب على المستوى الدولي</h3>
            
            {isLoading ? (
              <div className="text-center py-4">جاري التحميل...</div>
            ) : (
              <>
                <div className="space-y-2">
                  {globalRankings.map((user) => (
                    <div 
                      key={user.username} 
                      className={`flex items-center justify-between p-2 rounded ${user.isCurrentUser ? 'bg-blue-800/50' : ''}`}
                    >
                      <div className="flex items-center">
                        <span className={`w-6 text-center font-bold ${user.position <= 3 ? 'text-yellow-400' : 'text-blue-300'}`}>
                          {user.position}
                        </span>
                        <span className="mr-3">{user.username}</span>
                      </div>
                      <span className="font-bold">{user.score}</span>
                    </div>
                  ))}
                </div>
                
                {userGlobalRank && (
                  <div className="mt-4 pt-4 border-t border-blue-800">
                    <div className="flex items-center justify-between p-2 rounded bg-blue-800/50">
                      <div className="flex items-center">
                        <span className="w-6 text-center font-bold text-blue-300">
                          {userGlobalRank.position}
                        </span>
                        <span className="mr-3">{userGlobalRank.username}</span>
                      </div>
                      <span className="font-bold">{userGlobalRank.score}</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
        
        <motion.button
          className="card py-3 flex items-center justify-between"
          onClick={() => setShowWilayaRanking(!showWilayaRanking)}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-400 ml-3" />
            <span className="text-lg">ترتيب الولاية</span>
          </div>
          <span className="text-blue-300">{showWilayaRanking ? '▲' : '▼'}</span>
        </motion.button>
        
        {showWilayaRanking && (
          <motion.div
            className="card p-4"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-bold mb-4 text-center">أفضل 10 طلاب في ولاية {wilaya}</h3>
            
            {isLoading ? (
              <div className="text-center py-4">جاري التحميل...</div>
            ) : (
              <>
                <div className="space-y-2">
                  {wilayaRankings.map((user) => (
                    <div 
                      key={user.username} 
                      className={`flex items-center justify-between p-2 rounded ${user.isCurrentUser ? 'bg-blue-800/50' : ''}`}
                    >
                      <div className="flex items-center">
                        <span className={`w-6 text-center font-bold ${user.position <= 3 ? 'text-yellow-400' : 'text-blue-300'}`}>
                          {user.position}
                        </span>
                        <span className="mr-3">{user.username}</span>
                      </div>
                      <span className="font-bold">{user.score}</span>
                    </div>
                  ))}
                </div>
                
                {userWilayaRank && (
                  <div className="mt-4 pt-4 border-t border-blue-800">
                    <div className="flex items-center justify-between p-2 rounded bg-blue-800/50">
                      <div className="flex items-center">
                        <span className="w-6 text-center font-bold text-blue-300">
                          {userWilayaRank.position}
                        </span>
                        <span className="mr-3">{userWilayaRank.username}</span>
                      </div>
                      <span className="font-bold">{userWilayaRank.score}</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </div>
      
      <Navigation />
    </motion.div>
  );
};

export default Home;