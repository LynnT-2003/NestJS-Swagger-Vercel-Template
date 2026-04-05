import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../entity/team.entity';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
  ) {}

  async createTeam(team: Partial<Team>): Promise<Team> {
    return this.teamRepository.save(team);
  }

  async getTeamById(id: string): Promise<Team | undefined> {
    return this.teamRepository.findOne(id);
  }

  async updateTeam(id: string, team: Partial<Team>): Promise<Team | undefined> {
    await this.teamRepository.update(id, team);
    return this.teamRepository.findOne(id);
  }

  async deleteTeam(id: string): Promise<void> {
    await this.teamRepository.delete(id);
  }
}
