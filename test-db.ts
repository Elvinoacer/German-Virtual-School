import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const c = await prisma.course.findMany({ select: { title: true, status: true }})
  console.log(c)
}
main()
