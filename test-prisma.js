
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const courses = await prisma.course.findMany({ select: { title: true, level: true, status: true, price: true }})
  console.log(courses)
}
main()
