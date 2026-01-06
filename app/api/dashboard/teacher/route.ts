import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';
import { startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay, subDays } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    
    // Ensure only teachers access this
    if (payload.role !== 'TEACHER') {
      return errors.forbidden('Access denied');
    }

    const teacherId = payload.userId;
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    // Get teacher's course IDs first
    const teacherCourses = await prisma.course.findMany({
      where: { teacherId },
      select: { id: true }
    });
    const courseIds = teacherCourses.map(c => c.id);

    // Parallel fetch all data
    const [
      enrollmentsData,
      activeCourses,
      pendingSubmissions,
      urgentSubmissions,
      currentMonthInvoices,
      lastMonthInvoices,
      todaySchedule,
      last7DaysAttendance,
      courseDetails
    ] = await Promise.all([
      // Distinct students count
      prisma.enrollment.groupBy({
        by: ['studentId'],
        where: {
          courseId: { in: courseIds },
          status: 'ACTIVE'
        }
      }),
      // Active courses count
      prisma.course.count({
        where: {
          teacherId,
          status: 'PUBLISHED'
        }
      }),
      // Pending submissions count
      prisma.submission.count({
        where: {
          assignment: {
            courseId: { in: courseIds }
          },
          status: 'SUBMITTED'
        }
      }),
      // Urgent submissions (due soon or overdue)
      prisma.submission.count({
        where: {
          assignment: {
            courseId: { in: courseIds },
            dueDate: { lte: new Date(now.getTime() + 48 * 60 * 60 * 1000) } // Due within 48 hours
          },
          status: 'SUBMITTED'
        }
      }),
      // Current month revenue (teacher's courses)
      prisma.invoice.findMany({
        where: {
          enrollment: {
            courseId: { in: courseIds }
          },
          createdAt: {
            gte: currentMonthStart,
            lte: currentMonthEnd
          }
        },
        select: { amount: true }
      }),
      // Last month revenue
      prisma.invoice.findMany({
        where: {
          enrollment: {
            courseId: { in: courseIds }
          },
          createdAt: {
            gte: lastMonthStart,
            lte: lastMonthEnd
          }
        },
        select: { amount: true }
      }),
      // Today's Schedule
      prisma.classSession.findMany({
        where: {
          teacherId,
          startTime: {
            gte: todayStart,
            lte: todayEnd
          }
        },
        include: {
          course: {
            select: { title: true, level: true }
          }
        },
        orderBy: { startTime: 'asc' }
      }),
      // Last 7 days attendance for engagement
      prisma.attendanceRecord.findMany({
        where: {
          classSession: {
            teacherId,
            startTime: {
              gte: subDays(now, 7)
            }
          }
        },
        include: {
          classSession: {
            select: { startTime: true }
          }
        }
      }),
      // Course details for table
      prisma.course.findMany({
        where: {
          teacherId,
          status: 'PUBLISHED'
        },
        include: {
          enrollments: {
            where: { status: 'ACTIVE' },
            include: {
              student: {
                select: { id: true, image: true, firstName: true, lastName: true }
              }
            }
          }
        },
        take: 5
      })
    ]);

    // Calculate stats
    const totalStudents = enrollmentsData.length;
    const currentRevenue = currentMonthInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
    const lastRevenue = lastMonthInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
    
    const revenueTrend = lastRevenue > 0
      ? Math.round(((currentRevenue - lastRevenue) / lastRevenue) * 100)
      : 0;

    // Get grading queue (top assignments needing grading)
    const gradingQueue = await prisma.assignment.findMany({
      where: {
        courseId: { in: courseIds },
        submissions: {
          some: {
            status: 'SUBMITTED'
          }
        }
      },
      include: {
        submissions: {
          where: { status: 'SUBMITTED' },
          select: { id: true }
        },
        course: {
          select: { title: true }
        }
      },
      take: 5,
      orderBy: { dueDate: 'asc' }
    });

    // Calculate engagement data (last 7 days)
    const engagementByDay = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(now, 6 - i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dayAttendance = last7DaysAttendance.filter(a => {
        const sessionDate = new Date(a.classSession.startTime);
        return sessionDate >= dayStart && sessionDate <= dayEnd;
      });
      
      const presentCount = dayAttendance.filter(a => a.status === 'PRESENT').length;
      const totalCount = dayAttendance.length || 1;
      
      return {
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
        percentage: Math.round((presentCount / totalCount) * 100)
      };
    });

    // Format course details
    const formattedCourses = courseDetails.map(course => {
      const totalEnrollments = course.enrollments.length;
      const studentAvatars = course.enrollments.slice(0, 3).map(e => ({
        id: e.student.id,
        image: e.student.image,
        name: `${e.student.firstName} ${e.student.lastName}`
      }));
      
      // Calculate real average progress from enrollments
      const totalProgress = course.enrollments.reduce((sum, e) => sum + (e.progressPercentage || 0), 0);
      const progress = totalEnrollments > 0 ? Math.round(totalProgress / totalEnrollments) : 0;
      
      return {
        id: course.id,
        title: course.title,
        level: course.level,
        studentCount: totalEnrollments,
        students: studentAvatars,
        progress,
        status: course.status
      };
    });

    return successResponse({
      stats: {
        totalStudents,
        studentsTrend: 5, // Placeholder for now
        activeCourses,
        toGradeCount: pendingSubmissions,
        urgentCount: urgentSubmissions,
        monthlyRevenue: currentRevenue,
        revenueTrend
      },
      todaySchedule: todaySchedule.map(session => ({
        id: session.id,
        title: session.title,
        courseName: session.course.title,
        level: session.course.level,
        startTime: session.startTime,
        endTime: session.endTime,
        status: session.status,
        description: session.description
      })),
      gradingQueue: gradingQueue.map(assignment => ({
        id: assignment.id,
        title: assignment.title,
        courseName: assignment.course.title,
        submissionCount: assignment.submissions.length,
        dueDate: assignment.dueDate,
        type: 'assignment'
      })),
      engagementData: engagementByDay,
      activeCourses: formattedCourses
    });

  } catch (error) {
    console.error('Teacher dashboard error:', error);
    return errors.internal('Failed to fetch teacher dashboard data');
  }
}
