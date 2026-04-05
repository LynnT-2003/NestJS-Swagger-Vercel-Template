import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../entity/team.entity';

@Injectable()
export class TeamRoleService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
  ) {}

  async assignRole(teamId: string, userId: string, role: string): Promise<void> {
    const team = await this.teamRepository.findOne({ where: { id: teamId } });
    if (!team) {
      throw new Error('Team not found');
    }

    // Add logic to assign the role to the user within the team
    // For example:
    // team.members.push({ userId, role });
    // await this.teamRepository.save(team);
  }

  async removeRole(teamId: string, userId: string): Promise<void> {
    const team = await this.teamRepository.findOne({ where: { id: teamId } });
    if (!team) {
      throw new Error('Team not found');
    }

    // Add logic to remove the role from the user within the team
    // For example:
    // team.members = team.members.filter(member => member.userId !== userId);
    // await this.teamRepository.save(team);
  }
}
