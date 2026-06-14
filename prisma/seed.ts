import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

const DEMO = {
  tenantSlug: "demo",
  tenantName: "Demo Academy",
  adminEmail: "admin@demo.test",
  adminPassword: "password123",
  adminName: "Demo Instructor",
};

/**
 * Create (or fetch) a confirmed Supabase auth user via the service role.
 * Returns the auth user id, or null if Supabase env vars are not configured.
 */
async function ensureAuthUser(
  email: string,
  password: string,
  name: string
): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.warn(
      "  ⚠ Supabase env not set — skipping auth user creation. " +
        "The admin User row will link on first login by email."
    );
    return null;
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });

  if (data?.user) return data.user.id;

  // Already exists — look it up.
  if (error) {
    const { data: list } = await supabase.auth.admin.listUsers();
    const existing = list?.users.find((u) => u.email === email);
    if (existing) return existing.id;
    console.warn(`  ⚠ Could not create/find auth user: ${error.message}`);
  }
  return null;
}

async function main() {
  console.log("🌱 Seeding demo tenant…");

  const tenant = await prisma.tenant.upsert({
    where: { slug: DEMO.tenantSlug },
    update: {},
    create: {
      slug: DEMO.tenantSlug,
      name: DEMO.tenantName,
      primaryColor: "#4f46e5",
      accentColor: "#22d3ee",
      subscriptionStatus: "active",
      subscriptionPrice: 99000,
    },
  });
  console.log(`  ✓ Tenant: ${tenant.name} (${tenant.slug})`);

  const authId = await ensureAuthUser(
    DEMO.adminEmail,
    DEMO.adminPassword,
    DEMO.adminName
  );

  const admin = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: DEMO.adminEmail } },
    update: { authId: authId ?? undefined, role: "admin" },
    create: {
      tenantId: tenant.id,
      email: DEMO.adminEmail,
      name: DEMO.adminName,
      role: "admin",
      authId,
    },
  });
  console.log(`  ✓ Admin: ${admin.email} (role=${admin.role})`);

  // Platform owner (super admin), provisioned under the demo tenant.
  const superEmail = "super@demo.test";
  const superAuthId = await ensureAuthUser(superEmail, DEMO.adminPassword, "Platform Owner");
  const superAdmin = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: superEmail } },
    update: { authId: superAuthId ?? undefined, role: "superadmin" },
    create: {
      tenantId: tenant.id,
      email: superEmail,
      name: "Platform Owner",
      role: "superadmin",
      authId: superAuthId,
    },
  });
  console.log(`  ✓ Super admin: ${superAdmin.email} (role=${superAdmin.role})`);

  // Sample course with modules and lessons (first 2 lessons free).
  const existingCourse = await prisma.course.findFirst({
    where: { tenantId: tenant.id },
  });

  if (!existingCourse) {
    const course = await prisma.course.create({
      data: {
        tenantId: tenant.id,
        title: "Mastering Modern Web Development",
        description:
          "A complete, project-based course taking you from fundamentals to deploying production apps.",
        isPublished: true,
        modules: {
          create: [
            {
              title: "Getting Started",
              order: 0,
              lessons: {
                create: [
                  {
                    title: "Welcome & Course Overview",
                    description: "What you'll build and how to get the most out of this course.",
                    order: 0,
                    isFree: true,
                    videoDuration: 320,
                  },
                  {
                    title: "Setting Up Your Environment",
                    description: "Install the tools you need to follow along.",
                    order: 1,
                    isFree: true,
                    videoDuration: 540,
                  },
                ],
              },
            },
            {
              title: "Core Concepts",
              order: 1,
              lessons: {
                create: [
                  {
                    title: "Components & State",
                    order: 0,
                    videoDuration: 720,
                  },
                  {
                    title: "Data Fetching Patterns",
                    order: 1,
                    videoDuration: 810,
                  },
                  {
                    title: "Authentication Deep Dive",
                    order: 2,
                    videoDuration: 960,
                  },
                ],
              },
            },
            {
              title: "Shipping to Production",
              order: 2,
              lessons: {
                create: [
                  { title: "Deployment & CI/CD", order: 0, videoDuration: 680 },
                  { title: "Monitoring & Scaling", order: 1, videoDuration: 730 },
                ],
              },
            },
          ],
        },
      },
    });
    console.log(`  ✓ Course: ${course.title} (3 modules, 7 lessons, 2 free)`);

    await prisma.announcement.create({
      data: {
        tenantId: tenant.id,
        title: "Welcome to Demo Academy!",
        body: "We're excited to have you. New lessons drop every week — stay tuned.",
      },
    });
    console.log("  ✓ Sample announcement");
  } else {
    console.log("  • Course already exists, skipping curriculum seed");
  }

  // --- Engagement demo data (idempotent) ------------------------------------

  // Extra announcements so the widget has a few.
  if ((await prisma.announcement.count({ where: { tenantId: tenant.id } })) < 3) {
    await prisma.announcement.createMany({
      data: [
        {
          tenantId: tenant.id,
          title: "Jadwal live session minggu ini",
          body: "Live QnA hari Senin pukul 19:00 WIB. Sampai jumpa!",
        },
        {
          tenantId: tenant.id,
          title: "Materi baru telah ditambahkan",
          body: "Modul 'Shipping to Production' kini tersedia. Selamat belajar!",
        },
      ],
    });
    console.log("  ✓ Extra announcements");
  }

  // FAQ items.
  if ((await prisma.fAQ.count({ where: { tenantId: tenant.id } })) === 0) {
    await prisma.fAQ.createMany({
      data: [
        {
          tenantId: tenant.id,
          order: 0,
          question: "Bagaimana cara mengakses materi kursus?",
          answer:
            "Masuk ke menu 'Materi' di sidebar, lalu pilih pelajaran yang ingin kamu tonton.",
        },
        {
          tenantId: tenant.id,
          order: 1,
          question: "Apakah saya bisa menonton ulang video?",
          answer:
            "Tentu! Semua video bisa ditonton ulang kapan saja selama langgananmu aktif.",
        },
        {
          tenantId: tenant.id,
          order: 2,
          question: "Bagaimana cara bergabung dengan live session?",
          answer:
            "Buka menu 'Live Session'. Saat sesi dimulai, tombol 'Bergabung' akan aktif.",
        },
        {
          tenantId: tenant.id,
          order: 3,
          question: "Di mana saya bisa bertanya ke instruktur?",
          answer:
            "Gunakan menu 'Komunitas' untuk membuat diskusi. Instruktur akan menjawabnya di sana.",
        },
        {
          tenantId: tenant.id,
          order: 4,
          question: "Bagaimana cara mendapatkan sertifikat?",
          answer:
            "Selesaikan seluruh pelajaran berbayar, lalu sertifikatmu akan otomatis terbit.",
        },
      ],
    });
    console.log("  ✓ FAQ (5 items)");
  }

  // Demo streak + a couple of completed lessons this week for the admin.
  await prisma.user.update({
    where: { id: admin.id },
    data: {
      currentStreak: 5,
      longestStreak: 12,
      lastLearnedAt: new Date(Date.now() - 26 * 60 * 60 * 1000), // ~yesterday
    },
  });
  const someLessons = await prisma.lesson.findMany({
    where: { module: { course: { tenantId: tenant.id } } },
    orderBy: { order: "asc" },
    take: 2,
  });
  for (let i = 0; i < someLessons.length; i++) {
    const when = new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000);
    await prisma.progress.upsert({
      where: {
        userId_lessonId: { userId: admin.id, lessonId: someLessons[i].id },
      },
      update: { completedAt: when },
      create: {
        userId: admin.id,
        lessonId: someLessons[i].id,
        completedAt: when,
        watchedSeconds: 300,
      },
    });
  }

  // Sample badges.
  for (const key of ["pelajar_perdana", "berlangganan"]) {
    await prisma.badge.upsert({
      where: { userId_badgeKey: { userId: admin.id, badgeKey: key } },
      update: {},
      create: { userId: admin.id, badgeKey: key },
    });
  }

  // Sample notifications.
  const notif = (
    type: string,
    title: string,
    body: string,
    refId: string,
    link: string
  ) =>
    prisma.notification.upsert({
      where: { userId_type_refId: { userId: admin.id, type, refId } },
      update: {},
      create: { tenantId: tenant.id, userId: admin.id, type, title, body, refId, link },
    });
  await notif(
    "achievement",
    "Lencana baru: Pelajar Perdana",
    "Selamat! Kamu mendapatkan lencana 'Pelajar Perdana' 🎓",
    "pelajar_perdana",
    "/dashboard#pencapaian"
  );
  await notif(
    "live_soon",
    "Live session sebentar lagi!",
    "'Live QnA' akan dimulai kurang dari 1 jam lagi.",
    "demo-live",
    "/live"
  );
  console.log("  ✓ Demo streak, badges & notifications");

  // Demo forum threads (idempotent by title).
  async function ensureThread(data: {
    title: string;
    body: string;
    isPinned?: boolean;
    views?: number;
    reply?: { body: string; isInstructorReply?: boolean; upvotes?: number };
  }) {
    const existing = await prisma.forumThread.findFirst({
      where: { tenantId: tenant.id, title: data.title },
    });
    if (existing) return existing;
    const thread = await prisma.forumThread.create({
      data: {
        tenantId: tenant.id,
        userId: admin.id,
        title: data.title,
        body: data.body,
        isPinned: data.isPinned ?? false,
        views: data.views ?? 0,
      },
    });
    if (data.reply) {
      await prisma.forumReply.create({
        data: {
          threadId: thread.id,
          userId: admin.id,
          body: data.reply.body,
          isInstructorReply: data.reply.isInstructorReply ?? false,
          upvotes: data.reply.upvotes ?? 0,
        },
      });
    }
    return thread;
  }

  await ensureThread({
    title: "Selamat datang di komunitas! 👋",
    body: "Perkenalkan dirimu di sini dan ceritakan apa yang ingin kamu capai dengan kursus ini.",
    isPinned: true,
    views: 124,
    reply: { body: "Halo semua! Senang bisa belajar bareng 🎉", upvotes: 2 },
  });
  await ensureThread({
    title: "Bagaimana cara setup environment di Windows?",
    body: "Saya kesulitan menginstall tools di Windows 11. Ada yang bisa bantu langkah-langkahnya?",
    views: 58,
    reply: {
      body: "Pastikan kamu menginstall Node.js LTS dan menjalankan terminal sebagai administrator. Detail ada di lampiran pelajaran 2.",
      isInstructorReply: true,
      upvotes: 5,
    },
  });
  await ensureThread({
    title: "Tips agar konsisten belajar setiap hari?",
    body: "Streak saya sering putus. Bagaimana cara kalian menjaga konsistensi?",
    views: 33,
  });
  console.log("  ✓ Demo forum threads & replies");

  console.log("\n✅ Seed complete.");
  if (authId) {
    console.log(`\n   Admin login → ${DEMO.adminEmail} / ${DEMO.adminPassword}`);
    console.log(`   Visit: http://${DEMO.tenantSlug}.localhost:3000/login`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
