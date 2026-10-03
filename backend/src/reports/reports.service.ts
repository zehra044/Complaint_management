import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const groups = await this.prisma.db.orm.public.Complaints
      .groupBy('status')
      .aggregate((agg) => ({ count: agg.count() }));

    const byStatus: Record<string, number> = {
      OPEN: 0,
      IN_PROGRESS: 0,
      RESOLVED: 0,
    };

    for (const group of groups) {
      byStatus[group.status] = group.count;
    }

    const total = Object.values(byStatus).reduce((sum, n) => sum + n, 0);

    return { total, byStatus };
  }

  async getByType() {
    const groups = await this.prisma.db.orm.public.Complaints
      .groupBy('typeId')
      .aggregate((agg) => ({ count: agg.count() }));

    const types = await this.prisma.db.orm.public.ComplaintTypes.all();
    const nameById = new Map(types.map((t) => [t.typeId, t.name]));

    return groups
      .map((group) => ({
        typeId: group.typeId,
        typeName: nameById.get(group.typeId) ?? 'Unknown',
        count: group.count,
      }))
      .sort((a, b) => b.count - a.count);
  }
}