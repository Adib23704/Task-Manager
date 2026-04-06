import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
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

    if (dto.assignedUserId && dto.assignedUserId !== existing.assignedUserId) {
      await this.auditLogs.log({
        actorId,
        action: "TASK_ASSIGNED",
        targetEntityId: id,
        details: {
          previousAssignee: existing.assignedUserId,
          newAssignee: dto.assignedUserId,
        },
      });
    }

    if (dto.title || dto.description) {
      await this.auditLogs.log({
        actorId,
        action: "TASK_UPDATED",
        targetEntityId: id,
        details: {
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

    const updated = await this.prisma.task.update({
      where: { id },
      data: { assignedUserId },
    });

    await this.auditLogs.log({
      actorId,
      action: "TASK_ASSIGNED",
      targetEntityId: id,
      details: {
        previousAssignee: task.assignedUserId,
        newAssignee: assignedUserId,
      },
    });

    return updated;
  }
}
