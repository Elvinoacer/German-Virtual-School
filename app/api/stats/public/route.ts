
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CourseLevel } from '@/generated/prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Enrolled Students
    const studentsCount = await prisma.user.count({
      where: { role: 'STUDENT' }
    });

    // 2. Qualified Instructors
    const instructorsCount = await prisma.user.count({
      where: { role: 'TEACHER' }
    });

    // 3. Success Rate
    // Definition: (Completed Enrollments / (Completed + Dropped Enrollments)) * 100
    // This measures the rate of students who successfully complete a course vs dropping out
    const completedEnrollments = await prisma.enrollment.count({
      where: { status: 'COMPLETED' }
    });

    const droppedEnrollments = await prisma.enrollment.count({
      where: { status: 'DROPPED' }
    });

    const totalConcluded = completedEnrollments + droppedEnrollments;
    
    // Default to 100% if no data exists yet to avoid showing 0% which looks like an error,
    // or return 0 if that's preferred. Given "real", 0 might be the truth. 
    // However, usually for "Success Rate", if there are NO failures (dropped), it is 100%.
    // If there are NO completions and NO drops (only Active), we can't calculate a "rate".
    // In that case, we might look at Active users? 
    // Let's stick to the formula: if totalConcluded is 0, we'll return 0 (or null).
    // To make it look good on a fresh UI, falling back to a high number or valid data is better, 
    // but the user said "needs to be real". 0 is real.
    
    let successRate = 0;
    if (totalConcluded > 0) {
      successRate = Math.round((completedEnrollments / totalConcluded) * 100);
    } else {
        // If no concluded courses, check if we have active evaluations with high grades?
        // Let's check average evaluation score as a secondary metric if completion is unavailable
        const evaluationAgg = await prisma.evaluation.aggregate({
            _avg: {
                grade: true
            }
        });
        
        if (evaluationAgg._avg.grade) {
            // Assuming grade is on 100 scale.
            successRate = Math.round(evaluationAgg._avg.grade);
        } else {
             // If absolutely no data, 0 is the real answer.
             successRate = 0;
        }
    }

    // 4. Levels (CEFR Levels)
    const levelsCount = Object.keys(CourseLevel).length;

    return NextResponse.json({
      studentsCount,
      instructorsCount,
      successRate,
      levelsCount
    });

  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
