import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@church.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@church.com',
      password: adminPassword,
      isAdmin: true
    }
  });
  console.log('Admin user created:', admin.email);

  // Create ministries
  const ministries = [
    { name: 'Alabanza' },
    { name: 'Danzas' },
    { name: 'Producción' },
    { name: 'Predicación' },
    { name: 'Niños' },
    { name: 'Ujieres' }
  ];

  for (const ministry of ministries) {
    await prisma.ministry.upsert({
      where: { id: ministry.name.toLowerCase() },
      update: {},
      create: { id: ministry.name.toLowerCase(), name: ministry.name }
    });
  }
  console.log('Ministries created');

  // Create roles for Alabanza
  const alabanzaRoles = ['Vocalista', 'Batería', 'Bajo', 'Guitarra', 'Teclado', 'Director de Alabanza'];
  for (const role of alabanzaRoles) {
    await prisma.ministryRole.create({
      data: { name: role, ministryId: 'alabanza' }
    });
  }

  // Create roles for Danzas
  const danzasRoles = ['Bailarín', 'Coreógrafo'];
  for (const role of danzasRoles) {
    await prisma.ministryRole.create({
      data: { name: role, ministryId: 'danzas' }
    });
  }

  // Create roles for Producción
  const produccionRoles = ['Sonido', 'Video', 'Luces', 'Transmisión'];
  for (const role of produccionRoles) {
    await prisma.ministryRole.create({
      data: { name: role, ministryId: 'producción' }
    });
  }

  // Create roles for Predicación
  const predicacionRoles = ['Predicador', 'Invitado'];
  for (const role of predicacionRoles) {
    await prisma.ministryRole.create({
      data: { name: role, ministryId: 'predicación' }
    });
  }

  console.log('Roles created');
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
