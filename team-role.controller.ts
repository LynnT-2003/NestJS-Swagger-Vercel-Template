import { Controller, Get, Param, Post, Body, Put, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TeamRoleService } from './team-role.service';
import { CreateTeamRoleDto } from './dto/create-team-role.dto';
import { UpdateTeamRoleDto } from './dto/update-team-role.dto';

@Controller('teams/:teamId/roles')
@UseGuards(JwtAuthGuard)
export class TeamRoleController {
  constructor(private readonly teamRoleService: TeamRoleService) {}

  @Post()
  async create(@Param('teamId') teamId: string, @Body() createTeamRoleDto: CreateTeamRoleDto): Promise<void> {
    await this.teamRoleService.create(teamId, createTeamRoleDto);
  }

  @Get(':roleId')
  async findOne(@Param('teamId') teamId: string, @Param('roleId') roleId: string): Promise<any> {
    return this.teamRoleService.findOne(teamId, roleId);
  }

  @Put(':roleId')
  async update(@Param('teamId') teamId: string, @Param('roleId') roleId: string, @Body() updateTeamRoleDto: UpdateTeamRoleDto): Promise<void> {
    await this.teamRoleService.update(teamId, roleId, updateTeamRoleDto);
  }

  @Delete(':roleId')
  async remove(@Param('teamId') teamId: string, @Param('roleId') roleId: string): Promise<void> {
    await this.teamRoleService.remove(teamId, roleId);
  }
}
