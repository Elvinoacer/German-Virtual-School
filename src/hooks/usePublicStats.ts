
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';

interface PublicStats {
  studentsCount: number;
  instructorsCount: number;
  successRate: number;
  levelsCount: number;
}

export function usePublicStats() {
  const [stats, setStats] = useState<PublicStats>({
    studentsCount: 0,
    instructorsCount: 0,
    successRate: 0,
    levelsCount: 6 // Default to 6 levels as that's constant (CEFR)
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get('/stats/public');
        setStats(prev => ({ ...prev, ...data }));
      } catch (err) {
        console.error('Failed to fetch statistics', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, isLoading, error };
}
