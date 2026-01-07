
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTestimonials() {
  try {
    const total = await prisma.testimonial.count();
    const publicReady = await prisma.testimonial.count({
      where: {
        isFeatured: true,
        isApproved: true,
      },
    });

    console.log(`Total Testimonials: ${total}`);
    console.log(`Public Ready (Featured & Approved): ${publicReady}`);

    if (total > 0 && publicReady === 0) {
        console.log("Found testimonials, but none are both featured and approved.");
        const sample = await prisma.testimonial.findFirst();
        console.log("Sample testimonial:", sample);
    }

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkTestimonials();
