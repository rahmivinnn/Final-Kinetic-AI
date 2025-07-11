import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Prevent multiple instances of Prisma Client in development
const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma
}

export { prisma }
