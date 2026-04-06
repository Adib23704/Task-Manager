import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async log(data: {
    actorId: string;
    action: string;
    targetEntityId: string;
    details: Record<string, any>;
  }) {
    return this.prisma.auditLog.create({ data });
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          actor: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.auditLog.count(),
    ]);

    return {
      data: logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
