import { ReportsService } from './reports.service.js';

// The "answer key": a fake prisma that returns whatever data we hand it.
function makePrisma(groups: unknown[], types: unknown[] = []) {
  return {
    db: {
      orm: {
        public: {
          Complaints: { groupBy: () => ({ aggregate: async () => groups }) },
          ComplaintTypes: { all: async () => types },
        },
      },
    },
  };
}

describe('ReportsService', () => {
  it('counts complaints per status and fills missing statuses with 0', async () => {
    const service = new ReportsService(
      makePrisma([
        { status: 'OPEN', count: 2 },
        { status: 'RESOLVED', count: 1 },
      ]) as never,
    );

    const result = await service.getSummary();

    expect(result).toEqual({
      total: 3,
      byStatus: { OPEN: 2, IN_PROGRESS: 0, RESOLVED: 1 },
    });
  });

  it('returns all zeros when there are no complaints', async () => {
    const service = new ReportsService(makePrisma([]) as never);

    const result = await service.getSummary();

    expect(result).toEqual({
      total: 0,
      byStatus: { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0 },
    });
  });

  it('counts complaints per type and includes type names', async () => {
    const service = new ReportsService(
      makePrisma(
        [
          { typeId: 1, count: 1 },
          { typeId: 3, count: 4 },
          { typeId: 2, count: 2 },
        ],
        [
          { typeId: 1, name: 'Missing item' },
          { typeId: 2, name: 'Product quality' },
          { typeId: 3, name: 'Late delivery' },
        ]
      ) as never
    );

    const result = await service.getByType();

    expect(result).toEqual([
      { typeId: 3, typeName: 'Late delivery', count: 4 },
      { typeId: 2, typeName: 'Product quality', count: 2 },
      { typeId: 1, typeName: 'Missing item', count: 1 },
    ]);
  });
});
