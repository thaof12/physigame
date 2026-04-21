import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';

/**
 * Hook để trigger cập nhật quest progress khi người dùng hoàn thành các hoạt động
 * Usage:
 *   const { triggerQuest } = useQuestTrigger();
 *   triggerQuest('complete_lesson', { score: 90, lessonId: 'chapter1-lesson1' });
 */
const useQuestTrigger = () => {
  const { user } = useAuth();

  /**
   * Trigger cập nhật quest progress
   * @param {string} action - Loại hành động: 'complete_lesson', 'perfect_score', 'complete_challenge', 'win_pk', 'study_time', 'experiment_complete'
   * @param {object} data - Dữ liệu liên quan đến hành động
   */
  const triggerQuest = useCallback(async (action, data = {}) => {
    if (!user?.uid) {
      console.log('No user logged in, skipping quest trigger');
      return null;
    }

    try {
      const response = await api.post(`/quests/${user.uid}/trigger`, {
        action,
        data
      });
      
      if (response.data.success) {
        // Log any achievements unlocked
        if (response.data.achievementsUnlocked?.length > 0) {
          console.log('🏆 Achievements unlocked:', response.data.achievementsUnlocked);
        }
        
        // Log quest updates
        if (response.data.questsUpdated?.length > 0) {
          console.log('📝 Quests updated:', response.data.questsUpdated);
        }
        
        return response.data;
      }
    } catch (error) {
      console.error('Error triggering quest:', error);
    }
    
    return null;
  }, [user?.uid]);

  /**
   * Các helper functions cho các action cụ thể
   */
  const onLessonComplete = useCallback((lessonData) => {
    return triggerQuest('complete_lesson', lessonData);
  }, [triggerQuest]);

  const onPerfectScore = useCallback((lessonData) => {
    return triggerQuest('perfect_score', lessonData);
  }, [triggerQuest]);

  const onChallengeComplete = useCallback((challengeData) => {
    return triggerQuest('complete_challenge', challengeData);
  }, [triggerQuest]);

  const onPKWin = useCallback((pkData) => {
    return triggerQuest('win_pk', pkData);
  }, [triggerQuest]);

  const onPKPlay = useCallback((pkData) => {
    return triggerQuest('play_pk', pkData);
  }, [triggerQuest]);

  const onExperimentComplete = useCallback((experimentData) => {
    return triggerQuest('experiment_complete', experimentData);
  }, [triggerQuest]);

  const onStudyTime = useCallback((minutes) => {
    return triggerQuest('study_time', { minutes });
  }, [triggerQuest]);

  return {
    triggerQuest,
    onLessonComplete,
    onPerfectScore,
    onChallengeComplete,
    onPKWin,
    onPKPlay,
    onExperimentComplete,
    onStudyTime
  };
};

export default useQuestTrigger;
