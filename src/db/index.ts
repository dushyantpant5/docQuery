// // import { PrismaClient } from "@prisma/client";

// declare global {
//   var cachedPrisma: PrismaClient;
// }

// // let prisma: PrismaClient;
// // if (process.env.NODE_ENV === "production") {
// //   prisma = new PrismaClient();
// // } else {
// //   if (!global.cachedPrisma) {
// //     global.cachedPrisma = new PrismaClient();
// //   }
// //   prisma = global.cachedPrisma;
// // }

// // export const db = prisma;

import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

const prismaClientSingleton = () => {
  return new PrismaClient().$extends(withAccelerate());
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export const db = prisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
