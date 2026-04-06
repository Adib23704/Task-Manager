import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Roles, RolesGuard } from "../auth/guards/roles.guard";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { TasksService } from "./tasks.service";

@Controller("tasks")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.tasksService.findAll(req.user.id, req.user.role);
  }

  @Post()
  @Roles("ADMIN")
  create(@Body() dto: CreateTaskDto, @Req() req: any) {
    return this.tasksService.create(dto, req.user.id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateTaskDto, @Req() req: any) {
    return this.tasksService.update(id, dto, req.user.id, req.user.role);
  }

  @Delete(":id")
  @Roles("ADMIN")
  remove(@Param("id") id: string, @Req() req: any) {
    return this.tasksService.remove(id, req.user.id);
  }

  @Patch(":id/assign")
  @Roles("ADMIN")
  assign(@Param("id") id: string, @Body("assignedUserId") assignedUserId: string, @Req() req: any) {
    return this.tasksService.assign(id, assignedUserId, req.user.id);
  }
}
