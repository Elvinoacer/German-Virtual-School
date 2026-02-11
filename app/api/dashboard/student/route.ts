import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { successResponse, errors } from '@/lib/api-response';
import { startOfDay, endOfDay } from 'date-fns';
import { MeetingAudience } from '@/generated/prisma/client';

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    
    if (payload.role !== 'STUDENT') {
        return errors.forbidden('Access denied');
    }

    const { searchParams } = new URL(request.url);
    const historyPage = parseInt(searchParams.get('historyPage') || '1');
    const historyLimit = parseInt(searchParams.get('historyLimit') || '5');
    const historySkip = (historyPage - 1) * historyLimit;

    const studentId = payload.id || (payload as any).userId;

    // 1. Fetch Basic Enrollments & Course Data
    const enrollments = await prisma.enrollment.findMany({
        where: { studentId },
        include: {
            course: {
                include: {
                    teacher: {
                        select: { firstName: true, lastName: true }
                    },
                    modules: {
                        include: {
                            _count: {
                                select: { resources: true }
                            }
                        }
                    }
                }
            }
        }
    });

    const enrolledCourseIds = enrollments.map(e => e.courseId);
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    // 2. Parallel Fetch for Dependent Data
    const [
        todaySessions,
        pastSessions,
        pastSessionsTotal,
        invoices,
        attendanceRecords,
        pastSessionsCount,
        pendingAssignments,
        availableCourses,
        resourceProgress,
        currentTerm,
        termRegistration,
        todayAdminMeetings
    ] = await Promise.all([
        // Today's Sessions
        prisma.classSession.findMany({
            where: {
                courseId: { in: enrolledCourseIds },
                startTime: { gte: todayStart, lte: todayEnd }
            },
            orderBy: { startTime: 'asc' },
            include: {
                course: { select: { title: true } },
                teacher: { select: { firstName: true, lastName: true, avatarUrl: true, image: true } },
                _count: { select: { attendance: true } }
            }
        }),
        // Past Sessions History (Paginated)
        prisma.classSession.findMany({
            where: {
                courseId: { in: enrolledCourseIds },
                endTime: { lt: todayStart }
            },
            skip: historySkip,
            take: historyLimit,
            orderBy: { startTime: 'desc' },
            include: {
                course: { select: { title: true } },
                teacher: { select: { firstName: true, lastName: true } }
            }
        }),
        // Total count for pagination
        prisma.classSession.count({
            where: {
                courseId: { in: enrolledCourseIds },
                endTime: { lt: todayStart }
            }
        }),
        // Invoices for Balance
        prisma.invoice.findMany({
            where: {
                studentId,
                status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] }
            }
        }),
        // Attendance Records for Stats
        prisma.attendanceRecord.findMany({
             where: { studentId }
        }),
        // Count of Past Sessions for Rate Calculation
        prisma.classSession.count({
            where: {
                courseId: { in: enrolledCourseIds },
                endTime: { lt: now },
                status: { in: ['COMPLETED', 'LIVE'] }
            }
        }),
        // Pending Assignments
        prisma.assignment.findMany({
            where: {
                courseId: { in: enrolledCourseIds },
                dueDate: { gte: now },
                submissions: {
                    none: { studentId }
                }
            },
            take: 3,
            orderBy: { dueDate: 'asc' },
            include: { 
                course: { select: { title: true } }
            }
        }),
        // Available Courses (Not Enrolled)
        prisma.course.findMany({
            where: {
                status: 'PUBLISHED',
                id: { notIn: enrolledCourseIds }
            },
            take: 4,
            include: {
                teacher: { select: { firstName: true, lastName: true } },
                _count: { select: { modules: true } }
            }
        }),
        // Resource Progress for Accurate Weighted Overall Progress
        prisma.resourceProgress.findMany({
            where: {
                enrollment: { studentId },
                isCompleted: true
            }
        }),
        // Current Academic Term
        prisma.academicTerm.findFirst({
            where: { isCurrent: true }
        }),
        // Check if registered for current term
        prisma.termRegistration.findFirst({
            where: { 
                studentId,
                term: { isCurrent: true }
            }
        }),
        // Today's Admin Meetings (audience-based)
        prisma.adminMeeting.findMany({
            where: {
                startTime: { gte: todayStart, lte: todayEnd },
                OR: [
                    { audience: MeetingAudience.ALL_USERS },
                    { audience: MeetingAudience.ALL_STUDENTS },
                    { audience: MeetingAudience.SPECIFIC_STUDENTS, invitees: { some: { userId: studentId } } },
                ]
            },
            orderBy: { startTime: 'asc' },
            include: {
                createdBy: { select: { firstName: true, lastName: true, avatarUrl: true, image: true } }
            }
        })
    ]);

    // --- Calculations ---
    const totalInvoiced = invoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
    const totalPaid = invoices.reduce((sum, inv) => sum + Number(inv.paidAmount), 0);
    const totalBalance = totalInvoiced - totalPaid;
    
    // Improved Overdue Detection
    const hasOverdue = invoices.some(i => 
        i.status === 'OVERDUE' || 
        (i.status !== 'PAID' && new Date(i.dueDate) < now)
    );

    const presentCount = attendanceRecords.filter(a => ['PRESENT', 'LATE'].includes(a.status)).length;
    const attendanceRate = pastSessionsCount > 0 
        ? Math.round((presentCount / pastSessionsCount) * 100) 
        : 100;

    // Resource-Weighted Overall Progress
    const totalPossibleResources = enrollments.reduce((acc, e) => {
        return acc + e.course.modules.reduce((mAcc, m) => mAcc + (m._count?.resources || 0), 0);
    }, 0);
    
    const overallProgress = totalPossibleResources > 0
        ? Math.round((resourceProgress.length / totalPossibleResources) * 100)
        : 0;

    const completedCoursesCount = enrollments.filter(e => e.status === 'COMPLETED').length;

    return successResponse({
        stats: {
            attendance: attendanceRate,
            attendanceTrend: 0,
            progress: overallProgress,
            completedCourses: completedCoursesCount,
            balance: totalBalance,
            hasOverdue,
            oldestUnpaidInvoiceId: invoices.sort((a: any, b: any) => 
                new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            )[0]?.id || null
        },
        todaySessions: [
            ...todaySessions.map(session => ({
                ...session,
                attendeeCount: session._count.attendance,
                teacher: {
                    ...session.teacher,
                    image: session.teacher.image || session.teacher.avatarUrl
                }
            })),
            ...todayAdminMeetings.map(m => ({
                id: m.id,
                title: m.title,
                description: m.description,
                startTime: m.startTime,
                endTime: m.endTime,
                status: m.status,
                isAdminMeeting: true,
                course: { title: 'Admin Meeting' },
                teacher: {
                    firstName: m.createdBy.firstName,
                    lastName: m.createdBy.lastName,
                    image: m.createdBy.image || m.createdBy.avatarUrl,
                    avatarUrl: m.createdBy.avatarUrl
                },
                attendeeCount: 0
            }))
        ],
        history: {
            data: pastSessions.map(session => ({
                id: session.id,
                title: session.title,
                courseName: session.course.title,
                startTime: session.startTime,
                endTime: session.endTime,
                recordingUrl: session.recordingUrl,
                teacherName: `${session.teacher.firstName} ${session.teacher.lastName}`
            })),
            pagination: {
                total: pastSessionsTotal,
                page: historyPage,
                limit: historyLimit,
                totalPages: Math.ceil(pastSessionsTotal / historyLimit)
            }
        },
        courses: enrollments.map(e => ({
            id: e.course.id,
            title: e.course.title,
            lessonsCount: e.course.modules.reduce((acc, m) => acc + (m as any)._count?.resources || 0, 0),
            duration: e.course.durationWeeks,
            grade: e.grade || 'N/A',
            progress: e.progressPercentage,
            level: e.course.level,
            teacherName: `${e.course.teacher.firstName} ${e.course.teacher.lastName}`
        })),
        availableCourses: availableCourses.map(c => ({
            id: c.id,
            title: c.title,
            level: c.level,
            price: Number(c.price),
            teacherName: `${c.teacher.firstName} ${c.teacher.lastName}`,
            modulesCount: c._count.modules
        })),
        registration: termRegistration ? {
            id: termRegistration.id,
            registeredAt: termRegistration.createdAt
        } : null,
        currentTerm: currentTerm ? {
            id: currentTerm.id,
            name: currentTerm.name,
            startDate: currentTerm.startDate,
            endDate: currentTerm.endDate
        } : null,
        assignments: pendingAssignments.map(a => ({
            id: a.id,
            title: a.title,
            courseName: a.course.title,
            dueDate: a.dueDate,
            type: 'Assignment'
        }))
    });

  } catch (error) {
    console.error('Student dashboard error:', error);
    return errors.internal('Failed to fetch dashboard data');
  }
}
