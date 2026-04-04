import { Injectable } from '@nestjs/common';
import { CreateTeamDto, UpdateTeamDto } from './dto';

@Injectable()
export class TeamService {
  private teams: any[] = [];

  create(createTeamDto: CreateTeamDto) {
    const team = {
      id: this.teams.length + 1,
      ...createTeamDto,
    };
    this.teams.push(team);
    return team;
  }

  findAll() {
    return this.teams;
  }

  findOne(id: string) {
    return this.teams.find(team => team.id === parseInt(id));
  }

  update(id: string, updateTeamDto: UpdateTeamDto) {
    const index = this.teams.findIndex(team => team.id === parseInt(id));
    if (index !== -1) {
      this.teams[index] = { ...this.teams[index], ...updateTeamDto };
      return this.teams[index];
    }
    throw new Error(`Team with id ${id} not found`);
  }

  remove(id: string) {
    const index = this.teams.findIndex(team => team.id === parseInt(id));
    if (index !== -1) {
      this.teams.splice(index, 1);
      return { message: 'Team deleted' };
    }
    throw new Error(`Team with id ${id} not found`);
  }
}
