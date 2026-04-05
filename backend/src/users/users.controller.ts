import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Roles, RolesGuard } from "../auth/guards/roles.guard";
import { UsersService } from "./users.service";

@Controller("users")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles("ADMIN")
  findAll() {
    return this.usersService.findAll();
  }
}
