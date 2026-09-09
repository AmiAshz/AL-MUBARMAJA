require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { PrismaClient } = require('@prisma/client');
const socket = require('./src/utils/socket');

const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

const seedDatabase = async () => {
  try {
    const settingsCount = await prisma.workshopSettings.count();
    if (settingsCount === 0) {
      await prisma.workshopSettings.create({
        data: {
          nameAr: "المبرمج",
          nameEn: "AL Mubarmaja",
          phone: "+966 55 885 2934",
          email: "",
          addressAr: "المحالة، أبها، المملكة العربية السعودية",
          addressEn: "Almahalah, Abha, Saudi Arabia",
          googleMapsUrl: "https://maps.google.com/?q=18.2410405,42.5722994",
          latitude: 18.2410405,
          longitude: 42.5722994
        }
      });
      console.log('[DATABASE] Seeded default workshop settings.');
    }

    const bcrypt = require('bcryptjs');
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@123456';
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(defaultPassword, salt);

      await prisma.user.create({
        data: {
          name: 'Workshop Administrator',
          email: process.env.ADMIN_EMAIL || 'admin@almubarmaja.com',
          passwordHash,
          phone: '+966 55 885 2934',
          role: 'ADMIN',
          emailVerified: true,
          isActive: true
        }
      });
      console.log('[DATABASE] Seeded initial default administrator account.');
    }

    // Ensure owner account has ADMIN role
    await prisma.user.updateMany({
      where: { email: 'ameenaamiaan@gmail.com' },
      data: { role: 'ADMIN', emailVerified: true, isActive: true }
    });

    const servicesCount = await prisma.service.count();
    if (servicesCount === 0) {
      const defaultServices = [
        {
          nameAr: "صيانة المركبات",
          nameEn: "Vehicle Maintenance",
          descriptionAr: "أعمال الصيانة الدورية والوقائية للمساعدة في الحفاظ على أداء المركبة واعتماديتها.",
          descriptionEn: "Routine and preventive maintenance to help maintain your vehicle's performance and reliability."
        },
        {
          nameAr: "تشخيص المركبات",
          nameEn: "Vehicle Diagnosis",
          descriptionAr: "فحص وتشخيص دقيق لتحديد أسباب المشاكل قبل البدء في أعمال الإصلاح.",
          descriptionEn: "Accurate inspection and diagnosis to identify the cause of vehicle problems before repair work begins."
        },
        {
          nameAr: "إصلاح المركبات",
          nameEn: "Vehicle Repair",
          descriptionAr: "تنفيذ أعمال الإصلاح باحترافية وفقاً للحالة التي تم تشخيصها.",
          descriptionEn: "Professional repair services based on the diagnosed condition of the vehicle."
        },
        {
          nameAr: "فحص المركبات",
          nameEn: "Vehicle Inspection",
          descriptionAr: "فحص شامل للمركبة للكشف عن المشاكل الميكانيكية والفنية.",
          descriptionEn: "Detailed inspection of the vehicle to identify mechanical and technical issues."
        },
        {
          nameAr: "التشخيص الفني",
          nameEn: "Technical Diagnostics",
          descriptionAr: "اختبارات وتشخيص فني منهجي للوصول إلى الأعطال بدقة.",
          descriptionEn: "Systematic testing and technical diagnosis to identify faults accurately."
        },
        {
          nameAr: "فنيون متخصصون",
          nameEn: "Specialized Technicians",
          descriptionAr: "فنيون ذوو خبرة في فحص المركبات وتشخيصها وصيانتها وإصلاحها.",
          descriptionEn: "Experienced technicians handling inspection, diagnosis, maintenance, and repair work."
        },
        {
          nameAr: "متابعة كاملة للإصلاح",
          nameEn: "Complete Repair Follow-up",
          descriptionAr: "متابعة واضحة لمركبتك منذ استلامها وحتى التشخيص والإصلاح والانتهاء من العمل.",
          descriptionEn: "Clear tracking of your vehicle from intake through diagnosis, repair, and completion."
        }
      ];
      await prisma.service.createMany({ data: defaultServices });
      console.log('[DATABASE] Seeded default workshop services.');
    }
  } catch (err) {
    console.error('[SERVER ERROR] Database seeding failed:', err);
  }
};

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('[DATABASE] Successfully connected to MySQL');
    await seedDatabase();
    
    const server = http.createServer(app);
    const io = socket.init(server);

    io.on('connection', (socket) => {
      console.log(`[SOCKET] Client connected: ${socket.id}`);
      socket.on('disconnect', () => {
        console.log(`[SOCKET] Client disconnected: ${socket.id}`);
      });
    });
    
    server.listen(PORT, () => {
      console.log(`[SERVER] AL Mubarmaja / المبرمج Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error('[SERVER ERROR] Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
