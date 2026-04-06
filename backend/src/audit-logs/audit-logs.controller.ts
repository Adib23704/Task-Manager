import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Roles, RolesGuard } from "../auth/guards/roles.guard";
import { AuditLogsService } from "./audit-logs.service";

@Controller("audit-logs")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class AuditLogsController {
  constructor(private auditLogsService: AuditLogsService) {}

  @Get()
  @Roles("ADMIN")
  findAll(@Query("page") page?: string, @Query("limit") limit?: string) {
    return this.auditLogsService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }
}
