import { NextResponse } from "next/server";
import { auth } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, errors } from "@/lib/api-response";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "TEACHER") {
      return errors.unauthorized();
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const teacherId = session.user.id;

    const where: any = {
      AND: [],
    };

    if (status !== "all") {
      if (status === "PENDING") {
        where.AND.push({ status: { in: ["PENDING", "SUBMITTED"] } });
      } else {
        where.AND.push({ status: status });
      }
    }

    if (search) {
      const searchParts = search.trim().split(/\s+/).filter((p) => p.length > 0);
      if (searchParts.length > 0) {
        // Broad search: match EVERY part of the search string
        searchParts.forEach((part) => {
          where.AND.push({
            OR: [
              { student: { firstName: { contains: part, mode: "insensitive" } } },
              { student: { lastName: { contains: part, mode: "insensitive" } } },
              { student: { name: { contains: part, mode: "insensitive" } } },
              { student: { email: { contains: part, mode: "insensitive" } } },
              { assignment: { title: { contains: part, mode: "insensitive" } } },
            ],
          });
        });

        // Also add an OR condition for the full trimmed string if multiple words
        if (searchParts.length > 1) {
          const fullSearch = search.trim();
          where.AND.push({
            OR: [
              { student: { firstName: { contains: fullSearch, mode: "insensitive" } } },
              { student: { lastName: { contains: fullSearch, mode: "insensitive" } } },
              { student: { name: { contains: fullSearch, mode: "insensitive" } } },
              { student: { email: { contains: fullSearch, mode: "insensitive" } } },
              { assignment: { title: { contains: fullSearch, mode: "insensitive" } } },
            ],
          });
        }
      }
    }

    // Fetch total count for pagination
    const totalCount = await prisma.submission.count({ where });

    // Fetch submissions
    const submissions = await prisma.submission.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            image: true,
            email: true,
          },
        },
        assignment: {
          select: {
            id: true,
            title: true,
            course: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
      take: limit,
      skip: skip,
    });

    // Fetch global stats for the teacher
    const statsWhere = {};

    const [allSubmissionsCount, gradedCount, lateCount, pendingCount] = await Promise.all([
      prisma.submission.count({ where: statsWhere }),
      prisma.submission.count({ where: { ...statsWhere, status: "GRADED" } }),
      prisma.submission.count({ where: { ...statsWhere, status: "LATE" } }),
      prisma.submission.count({ where: { ...statsWhere, status: { in: ["PENDING", "SUBMITTED"] } } }),
    ]);

    return successResponse({
      submissions,
      stats: {
        total: allSubmissionsCount,
        graded: gradedCount,
        late: lateCount,
        pending: pendingCount,
      },
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching grading data:", error);
    return errorResponse("Failed to fetch grading data");
  }
}
