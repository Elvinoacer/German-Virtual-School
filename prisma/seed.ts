import { UserRole, CourseLevel, CourseStatus, EnrollmentStatus, ClassStatus, AttendanceStatus, PaymentStatus } from '../src/generated/prisma/client';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Start seeding ...');

  // Cleanup
  try {
    await prisma.notification.deleteMany();
    await prisma.message.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.submission.deleteMany();
    await prisma.assignment.deleteMany();
    await prisma.attendanceRecord.deleteMany();
    await prisma.classSession.deleteMany();
    await prisma.moduleProgress.deleteMany();
    await prisma.resource.deleteMany();
    await prisma.module.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.course.deleteMany();
    await prisma.studentProfile.deleteMany();
    await prisma.teacherProfile.deleteMany();
    await prisma.user.deleteMany();
  } catch (error) {
    console.log('Error clearing database (might be empty already):', error);
  }

  // 1. Create Users
  // Teacher
  const teacher = await prisma.user.create({
    data: {
      email: 'muller@gvs.de',
      firstName: 'Herr',
      lastName: 'Müller',
      role: UserRole.TEACHER,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKir3T1_3T0a0vwTXiTUAIF5jAFaWwEB09e8AMcrBFGdUfmUGC9tXGEPFJF-iacBTK9YGnHcO1whqhbd6GGG72Pg9BFrHg7k-tDG9p-17PYz0bJwq3R0zDFQw5PMKkHY4R-d6c5ID-e3Il_BXio6RxCVvzpRtNnxLYloK-KMElbx5WawAUvuYBx5JnYkYyiHdoGVi_po3aLxe5S_gK5lhegEzrSW13u04PWUNS1b5VcFdT8t-juzy0LXnKO9Odd4RMwV8j45VyKIk', 
      teacherProfile: {
        create: {
          bio: 'Experienced German teacher.',
          qualifications: ['PhD in German Literature'],
        }
      }
    }
  });

  // Student (Hans)
  const student = await prisma.user.create({
    data: {
      email: 'hans@student.com',
      firstName: 'Hans',
      lastName: 'Student',
      role: UserRole.STUDENT,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKir3T1_3T0a0vwTXiTUAIF5jAFaWwEB09e8AMcrBFGdUfmUGC9tXGEPFJF-iacBTK9YGnHcO1whqhbd6GGG72Pg9BFrHg7k-tDG9p-17PYz0bJwq3R0zDFQw5PMKkHY4R-d6c5ID-e3Il_BXio6RxCVvzpRtNnxLYloK-KMElbx5WawAUvuYBx5JnYkYyiHdoGVi_po3aLxe5S_gK5lhegEzrSW13u04PWUNS1b5VcFdT8t-juzy0LXnKO9Odd4RMwV8j45VyKIk',
      studentProfile: {
        create: {
          dateOfBirth: new Date('2000-01-01'),
        }
      }
    }
  });

  // 2. Create Courses
  const course1 = await prisma.course.create({
    data: {
      title: 'German B2 - Advanced Grammar',
      slug: 'german-b2-grammar',
      description: 'Master German grammar.',
      level: CourseLevel.B2,
      teacherId: teacher.id,
      price: 200,
      durationWeeks: 12,
      status: CourseStatus.PUBLISHED,
    }
  });

  const course2 = await prisma.course.create({
    data: {
      title: 'German Literature',
      slug: 'german-literature',
      description: 'Explore Goethe and more.',
      level: CourseLevel.C1,
      teacherId: teacher.id,
      price: 250,
      durationWeeks: 16,
      status: CourseStatus.PUBLISHED,
    }
  });

    const course3 = await prisma.course.create({
    data: {
      title: 'History of Berlin',
      slug: 'history-berlin',
      description: 'A walk through time.',
      level: CourseLevel.B1,
      teacherId: teacher.id,
      price: 150,
      durationWeeks: 8,
      status: CourseStatus.PUBLISHED,
    }
  });

  // 3. Enrollments
  const enr1 = await prisma.enrollment.create({
    data: {
      studentId: student.id,
      courseId: course1.id,
      progressPercentage: 65,
      grade: 'B+',
      status: EnrollmentStatus.ACTIVE
    }
  });

  await prisma.enrollment.create({
    data: {
      studentId: student.id,
      courseId: course2.id,
      progressPercentage: 78,
      grade: 'A-',
      status: EnrollmentStatus.ACTIVE
    }
  });
  
    await prisma.enrollment.create({
    data: {
      studentId: student.id,
      courseId: course3.id,
      progressPercentage: 45,
      grade: 'B',
      status: EnrollmentStatus.ACTIVE
    }
  });

  // 4. Class Sessions
  // Upcoming
  await prisma.classSession.create({
    data: {
      courseId: course1.id,
      teacherId: teacher.id,
      title: 'Subjunctive II Deep Dive',
      startTime: new Date(Date.now() + 1000 * 60 * 15), // Starts in 15 mins
      endTime: new Date(Date.now() + 1000 * 60 * 75),
      status: ClassStatus.SCHEDULED,
      attendance: {
          create: {
              studentId: student.id,
              status: AttendanceStatus.PRESENT
          }
      }
    }
  });

  // Past
  await prisma.classSession.create({
    data: {
      courseId: course1.id,
      teacherId: teacher.id,
      title: 'Intro to B2',
      startTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
      endTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7 + 1000 * 60 * 60),
      status: ClassStatus.COMPLETED,
      attendance: {
        create: {
          studentId: student.id,
          status: AttendanceStatus.PRESENT
        }
      }
    }
  });

  // 5. Assignments
  await prisma.assignment.create({
    data: {
      courseId: course2.id,
      title: 'Essay on Goethe',
      description: 'Write 500 words.',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24), // Tomorrow
      maxPoints: 100,
    }
  });

  await prisma.assignment.create({
    data: {
      courseId: course1.id,
      title: 'Vocabulary Quiz',
      description: 'Chapter 5 vocab.',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5), // 5 days
      maxPoints: 20,
    }
  });

  // 6. Invoices
  await prisma.invoice.create({
    data: {
      studentId: student.id,
      enrollmentId: enr1.id,
      amount: 150.00,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // Due in 3 days
      status: PaymentStatus.PENDING,
      paidAmount: 0
    }
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
