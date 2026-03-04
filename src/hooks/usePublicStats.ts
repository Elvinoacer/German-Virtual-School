
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';

interface CourseFee {
  id: string;
  title: string;
  level: string;
  price: number;
  durationWeeks: number;
  feePlans: { amount: number; billingCycle: string; installments: number }[];
}

interface FeeData {
  courses: CourseFee[];
  seatReservationFee: number | null;
  materialFee: number | null;
  materialFeeDeadline: string | null;
  intakeLabel: string | null;
}

interface PublicStats {
  studentsCount: number;
  instructorsCount: number;
  successRate: number;
  levelsCount: number;
  fees: FeeData | null;
}

export function usePublicStats() {
  const [stats, setStats] = useState<PublicStats>({
    studentsCount: 0,
    instructorsCount: 0,
    successRate: 0,
    levelsCount: 6,
    fees: null,
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
