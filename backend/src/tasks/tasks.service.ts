import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { AuditLogsService } from "../audit-logs/audit-logs.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private auditLogs: AuditLogsService,
  ) {}

  private async getUserName(userId: string | null): Promise<string> {
    if (!userId) return "Unassigned";
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });
    return user?.name || "Unknown";
  }

  async findAll(userId: string, role: string) {
    if (role === "ADMIN") {
      return this.prisma.task.findMany({
        include: {
          assignee: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return this.prisma.task.findMany({
      where: { assignedUserId: userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(dto: CreateTaskDto, actorId: string) {
    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        assignedUserId: dto.assignedUserId || null,
      },
    });

    await this.auditLogs.log({
      actorId,
      action: "TASK_CREATED",
      targetEntityId: task.id,
      details: { title: task.title, description: task.description },
    });

    return task;
  }

  async update(id: string, dto: UpdateTaskDto, actorId: string, role: string) {
    const existing = await this.prisma.task.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Task not found");

    if (role === "USER") {
      if (existing.assignedUserId !== actorId) {
        throw new ForbiddenException("You can only update your own tasks");
      }
      if (dto.title || dto.description || dto.assignedUserId) {
        throw new ForbiddenException("You can only change the task status");
      }
    }

    const updated = await this.prisma.task.update({
      where: { id },
      data: dto,
    });

    if (dto.status && dto.status !== existing.status) {
      await this.auditLogs.log({
        actorId,
        action: "STATUS_CHANGED",
        targetEntityId: id,
        details: { from: existing.status, to: dto.status },
      });
    }

    if (dto.assignedUserId !== undefined && dto.assignedUserId !== existing.assignedUserId) {
      const fromName = await this.getUserName(existing.assignedUserId);
      const toName = await this.getUserName(dto.assignedUserId);

      await this.auditLogs.log({
        actorId,
        action: "TASK_ASSIGNED",
        targetEntityId: id,
        details: { from: fromName, to: toName },
      });
    }

    const titleChanged = dto.title !== undefined && dto.title !== existing.title;
    const descChanged = dto.description !== undefined && dto.description !== existing.description;
    if (titleChanged || descChanged) {
      const changedFields: string[] = [];
      if (titleChanged) changedFields.push("title");
      if (descChanged) changedFields.push("description");

      await this.auditLogs.log({
        actorId,
        action: "TASK_UPDATED",
        targetEntityId: id,
        details: {
          fields: changedFields,
          before: { title: existing.title, description: existing.description },
          after: { title: updated.title, description: updated.description },
        },
      });
    }

    return updated;
  }

  async remove(id: string, actorId: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException("Task not found");

    await this.auditLogs.log({
      actorId,
      action: "TASK_DELETED",
      targetEntityId: id,
      details: { title: task.title },
    });

    await this.prisma.task.delete({ where: { id } });

    return { message: "Task deleted" };
  }

  async assign(id: string, assignedUserId: string, actorId: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException("Task not found");

    const fromName = await this.getUserName(task.assignedUserId);
    const toName = await this.getUserName(assignedUserId);

    const updated = await this.prisma.task.update({
      where: { id },
      data: { assignedUserId },
    });

    await this.auditLogs.log({
      actorId,
      action: "TASK_ASSIGNED",
      targetEntityId: id,
      details: { from: fromName, to: toName },
    });

    return updated;
  }
}
