import { prisma } from "@/lib/prisma";

type AuditInput = {
  actorId: string;
  action: string;
  target: string;
  details?: Record<string, unknown>;
};

export async function writeAuditLog({ actorId, action, target, details }: AuditInput) {
  await prisma.auditLog.create({
    data: {
      actorId,
      action,
      target,
      details: details ? JSON.stringify(details) : null,
    },
  });
}
