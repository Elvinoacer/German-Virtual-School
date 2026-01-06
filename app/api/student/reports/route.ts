import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';
import { calculateEvaluationGrade } from '@/lib/grading';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    
    if (user.role !== 'STUDENT') {
      return errors.forbidden('Access denied');
    }

    const studentId = user.id;

    // 1. Fetch Enrolled Courses for filters and subject overview
    const enrollments = await prisma.enrollment.findMany({
      where: { 
        studentId,
        status: 'ACTIVE'
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            level: true,
            teacher: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
                image: true
              }
            }
          }
        }
      }
    });

    const activeCourseIds = enrollments.map(e => e.courseId);

    // 2. Attendance Summary from ACTUAL records (Jitsi tracked)
    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: { studentId },
      select: { status: true }
    });

    const totalDays = attendanceRecords.length;
    let present = 0, late = 0, absent = 0, excused = 0;
    
    attendanceRecords.forEach(r => {
      if (r.status === 'PRESENT') present++;
      else if (r.status === 'LATE') late++;
      else if (r.status === 'ABSENT') absent++;
      else if (r.status === 'EXCUSED') excused++;
    });

    const attendanceStats = {
      percentage: totalDays > 0 ? Math.round(((present + (late * 0.7)) / totalDays) * 100) : 0, // Weighted late
      present,
      late,
      absent,
      totalDays
    };

    // 3. Performance Trend (Last 6 Months)
    // We fetch evaluations to build the trend
    const lastSixMonths = Array.from({ length: 6 }).map((_, i) => {
      const date = subMonths(new Date(), i);
      return {
        start: startOfMonth(date),
        end: endOfMonth(date),
        label: format(date, 'MMM')
      };
    }).reverse();

    const evaluations = await prisma.evaluation.findMany({
      where: { studentId },
      include: {
        course: { select: { id: true, title: true } },
        teacher: { select: { firstName: true, lastName: true, image: true, avatarUrl: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const performanceTrend = lastSixMonths.map(month => {
      const monthEvals = evaluations.filter(e => 
        e.createdAt >= month.start && e.createdAt <= month.end
      );
      
      const avg = monthEvals.length > 0 
        ? Math.round(monthEvals.reduce((acc, e) => acc + (e.grade || calculateEvaluationGrade(e)), 0) / monthEvals.length)
        : 0;

      return {
        month: month.label,
        average: avg
      };
    });

    // 4. Course Evaluations (Subject Overview renamed)
    const courseEvaluations = enrollments.map(enrollment => {
      const courseEvals = evaluations.filter(e => e.courseId === enrollment.courseId);
      const latestEval = courseEvals[0]; // Already sorted by desc creation
      
      // Calculate trend from last two evals if available
      let trend: 'up' | 'down' | 'flat' = 'flat';
      if (courseEvals.length >= 2) {
        const current = latestEval.grade || calculateEvaluationGrade(latestEval);
        const previous = courseEvals[1].grade || calculateEvaluationGrade(courseEvals[1]);
        if (current > previous) trend = 'up';
        else if (current < previous) trend = 'down';
      }

      return {
        id: enrollment.courseId,
        subject: enrollment.course.title,
        teacher: `${enrollment.course.teacher.firstName} ${enrollment.course.teacher.lastName}`,
        grade: latestEval ? (latestEval.grade || calculateEvaluationGrade(latestEval)).toString() : 'N/A',
        trend: latestEval?.trend || trend,
        level: enrollment.course.level
      };
    });

    // 5. Teacher Feedback (Evaluation Comments)
    const teacherNotes = evaluations
      .filter(e => e.overallComment)
      .slice(0, 10) // Only latest 10
      .map(e => ({
        id: e.id,
        category: e.category || 'General',
        date: e.createdAt.toISOString(),
        text: e.overallComment || '',
        teacher: `${e.teacher.firstName} ${e.teacher.lastName}`,
        avatar: e.teacher.image || e.teacher.avatarUrl || ''
      }));

    return successResponse({
      attendance: attendanceStats,
      evaluations: courseEvaluations,
      teacherNotes,
      performanceTrend,
      courses: enrollments.map(e => ({ id: e.courseId, title: e.course.title }))
    });

  } catch (error) {
    console.error('[REPORT_STATS_ERROR]', error);
    return errors.internal('Failed to generate report data');
  }
}