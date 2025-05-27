import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookText, ChevronDown, ChevronUp, Plus, X, Check } from 'lucide-react';
import { useStore } from '../lib/useStore';
import { supabase } from '../lib/supabase';
import Navigation from '../components/Navigation';

interface Subject {
  id: string;
  name: string;
  completionPercentage: number;
}

interface Specialization {
  name: string;
  years: { year: number; completed: boolean; id?: string }[];
}

const defaultSubjects = [
  'الرياضيات',
  'الفيزياء',
  'اللغة العربية',
  'الفلسفة',
  'العلوم الطبيعية',
  'التاريخ والجغرافيا'
];

const specializations = [
  'علوم تجريبية',
  'تقني رياضي',
  'رياضيات',
  'آداب وفلسفة',
  'لغات أجنبية',
  'تسيير واقتصاد'
];

const years = Array.from({ length: 18 }, (_, i) => 2008 + i);

const Subjects: React.FC = () => {
  const { userId } = useStore();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(null);
  const [specializationData, setSpecializationData] = useState<Specialization[]>([]);
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});
  const [expandedSpecializations, setExpandedSpecializations] = useState<Record<string, boolean>>({});
  const [isAddingSubject, setIsAddingSubject] = useState<boolean>(false);
  const [newSubjectName, setNewSubjectName] = useState<string>('');
  const [overallCompletion, setOverallCompletion] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (userId) {
      fetchSubjects();
    }
  }, [userId]);

  useEffect(() => {
    // Calculate overall completion percentage
    if (subjects.length > 0) {
      const totalPercentage = subjects.reduce((sum, subject) => sum + subject.completionPercentage, 0);
      setOverallCompletion(Math.round(totalPercentage / subjects.length));
    } else {
      setOverallCompletion(0);
    }
  }, [subjects]);

  const fetchSubjects = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      // Get user's subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('id, name')
        .eq('user_id', userId);
      
      if (subjectsError) throw subjectsError;
      
      if (!subjectsData || subjectsData.length === 0) {
        // If no subjects, create default subjects
        await createDefaultSubjects();
        return;
      }
      
      // Get completion data for all subjects
      const subjectsWithCompletion: Subject[] = await Promise.all(
        subjectsData.map(async (subject) => {
          const completionPercentage = await calculateSubjectCompletion(subject.id);
          return {
            id: subject.id,
            name: subject.name,
            completionPercentage
          };
        })
      );
      
      setSubjects(subjectsWithCompletion);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createDefaultSubjects = async () => {
    if (!userId) return;
    
    try {
      // Create default subjects
      const subjectPromises = defaultSubjects.map(name => 
        supabase
          .from('subjects')
          .insert({ name, user_id: userId })
          .select()
      );
      
      const results = await Promise.all(subjectPromises);
      
      // Check for errors
      results.forEach((result) => {
        if (result.error) throw result.error;
      });
      
      // Re-fetch subjects
      fetchSubjects();
    } catch (error) {
      console.error('Error creating default subjects:', error);
    }
  };

  const calculateSubjectCompletion = async (subjectId: string): Promise<number> => {
    try {
      // Get total possible combinations (specializations * years)
      const totalPossible = specializations.length * years.length;
      
      // Get completed entries
      const { data, error } = await supabase
        .from('subject_progress')
        .select('id')
        .eq('subject_id', subjectId)
        .eq('completed', true);
      
      if (error) throw error;
      
      // Calculate percentage
      const completed = data ? data.length : 0;
      return totalPossible > 0 ? Math.round((completed / totalPossible) * 100) : 0;
    } catch (error) {
      console.error('Error calculating completion:', error);
      return 0;
    }
  };

  const fetchSpecializationData = async (subjectId: string) => {
    try {
      // Get all progress data for this subject
      const { data, error } = await supabase
        .from('subject_progress')
        .select('id, specialization, year, completed')
        .eq('subject_id', subjectId)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Organize data by specialization
      const specData = specializations.map(spec => {
        const yearData = years.map(year => {
          const progressEntry = data?.find(
            entry => entry.specialization === spec && entry.year === year
          );
          
          return {
            year,
            completed: progressEntry ? progressEntry.completed : false,
            id: progressEntry?.id
          };
        });
        
        return {
          name: spec,
          years: yearData
        };
      });
      
      setSpecializationData(specData);
    } catch (error) {
      console.error('Error fetching specialization data:', error);
    }
  };

  const handleSubjectClick = (subject: Subject) => {
    if (selectedSubject?.id === subject.id) {
      // Toggle expansion
      setExpandedSubjects(prev => ({
        ...prev,
        [subject.id]: !prev[subject.id]
      }));
    } else {
      // Select new subject
      setSelectedSubject(subject);
      setSelectedSpecialization(null);
      setExpandedSubjects(prev => ({
        ...prev,
        [subject.id]: true
      }));
      fetchSpecializationData(subject.id);
    }
  };

  const handleSpecializationClick = (spec: string) => {
    setSelectedSpecialization(prev => prev === spec ? null : spec);
    setExpandedSpecializations(prev => ({
      ...prev,
      [spec]: !prev[spec]
    }));
  };

  const handleYearClick = async (year: number, completed: boolean, progressId?: string) => {
    if (!selectedSubject || !selectedSpecialization || !userId) return;
    
    try {
      if (progressId) {
        // Update existing progress
        await supabase
          .from('subject_progress')
          .update({ completed: !completed })
          .eq('id', progressId);
      } else {
        // Create new progress entry
        await supabase
          .from('subject_progress')
          .insert({
            user_id: userId,
            subject_id: selectedSubject.id,
            specialization: selectedSpecialization,
            year,
            completed: true
          });
      }
      
      // Refresh data
      fetchSpecializationData(selectedSubject.id);
      
      // Update completion percentage
      const updatedCompletion = await calculateSubjectCompletion(selectedSubject.id);
      setSubjects(prev => 
        prev.map(s => 
          s.id === selectedSubject.id 
            ? { ...s, completionPercentage: updatedCompletion } 
            : s
        )
      );
    } catch (error) {
      console.error('Error updating year progress:', error);
    }
  };

  const handleAddSubject = async () => {
    if (!newSubjectName.trim() || !userId) return;
    
    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert({
          name: newSubjectName.trim(),
          user_id: userId
        })
        .select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        // Add new subject to the list
        setSubjects(prev => [
          ...prev,
          {
            id: data[0].id,
            name: data[0].name,
            completionPercentage: 0
          }
        ]);
      }
      
      // Reset form
      setNewSubjectName('');
      setIsAddingSubject(false);
    } catch (error) {
      console.error('Error adding subject:', error);
    }
  };

  const handleDeleteSubject = async (subjectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) return;
    
    try {
      await supabase
        .from('subjects')
        .delete()
        .eq('id', subjectId)
        .eq('user_id', userId);
      
      // Remove subject from list
      setSubjects(prev => prev.filter(s => s.id !== subjectId));
      
      // Reset selection if needed
      if (selectedSubject?.id === subjectId) {
        setSelectedSubject(null);
        setSelectedSpecialization(null);
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
    }
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <BookText className="h-6 w-6 text-blue-300 ml-2" />
            <h2 className="text-lg font-bold">المواد الدراسية</h2>
          </div>
        </div>
        
        <div className="flex flex-col items-center mb-4">
          <div className="w-full bg-blue-950 rounded-full h-4 mb-2">
            <motion.div 
              className="bg-blue-500 h-4 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${overallCompletion}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
          <div className="text-center">
            <span className="font-bold">{overallCompletion}%</span>
            <span className="text-blue-200 mr-1">النسبة الكلية لإنجاز البكالوريا</span>
          </div>
        </div>
      </motion.div>
      
      {isLoading ? (
        <div className="card p-8 text-center">
          <p>جاري تحميل المواد الدراسية...</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-4">
            {subjects.map((subject, index) => (
              <motion.div 
                key={subject.id}
                className="card cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                onClick={() => handleSubjectClick(subject)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-lg">{subject.name}</span>
                    <span className="text-sm text-blue-300 mr-2">({subject.completionPercentage}%)</span>
                  </div>
                  <div className="flex items-center">
                    <button 
                      className="text-red-400 hover:text-red-300 ml-3"
                      onClick={(e) => handleDeleteSubject(subject.id, e)}
                    >
                      <X className="h-5 w-5" />
                    </button>
                    {expandedSubjects[subject.id] ? (
                      <ChevronUp className="h-5 w-5 text-blue-300" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-blue-300" />
                    )}
                  </div>
                </div>
                
                {expandedSubjects[subject.id] && (
                  <motion.div 
                    className="mt-4 space-y-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-blue-200 mb-3">اختر الشعبة:</p>
                    
                    {specializations.map((spec) => (
                      <div key={spec} className="border-t border-blue-800 pt-2">
                        <button
                          className="w-full flex items-center justify-between py-2"
                          onClick={() => handleSpecializationClick(spec)}
                        >
                          <span>{spec}</span>
                          {expandedSpecializations[spec] ? (
                            <ChevronUp className="h-4 w-4 text-blue-300" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-blue-300" />
                          )}
                        </button>
                        
                        {selectedSpecialization === spec && expandedSpecializations[spec] && (
                          <motion.div 
                            className="grid grid-cols-3 gap-2 mt-2"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.3 }}
                          >
                            {specializationData
                              .find(s => s.name === spec)
                              ?.years.map(yearData => (
                                <motion.button
                                  key={yearData.year}
                                  className={`p-2 rounded ${
                                    yearData.completed 
                                      ? 'bg-green-800/30 text-green-100 border border-green-700' 
                                      : 'bg-blue-900/30 border border-blue-800'
                                  }`}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleYearClick(
                                    yearData.year, 
                                    yearData.completed,
                                    yearData.id
                                  )}
                                >
                                  <div className="flex items-center justify-center">
                                    <span>{yearData.year}</span>
                                    {yearData.completed && (
                                      <Check className="h-4 w-4 mr-1 text-green-400" />
                                    )}
                                  </div>
                                </motion.button>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
          
          {isAddingSubject ? (
            <motion.div 
              className="card"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center mb-4">
                <h3 className="text-lg">إضافة مادة جديدة</h3>
              </div>
              
              <div className="mb-4">
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="اسم المادة"
                  className="dropdown w-full"
                />
              </div>
              
              <div className="flex space-x-2 space-x-reverse">
                <button 
                  className="btn-primary"
                  onClick={handleAddSubject}
                >
                  إضافة
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => {
                    setIsAddingSubject(false);
                    setNewSubjectName('');
                  }}
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              className="btn-primary w-full flex items-center justify-center"
              onClick={() => setIsAddingSubject(true)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="h-5 w-5 ml-1" />
              إضافة مادة جديدة
            </motion.button>
          )}
        </>
      )}
      
      <Navigation />
    </motion.div>
  );
};

export default Subjects;