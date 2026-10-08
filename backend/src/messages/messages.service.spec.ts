import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { MessagesService } from './messages.service.js';

// Builds the service with a fake database holding whatever you pass in.
// Anything you leave out is "not found" (null).
function makeService(
  data: { complaint?: unknown; customer?: unknown; employee?: unknown } = {},
) {
  const created: unknown[] = [];
  const prisma = {
    db: {
      orm: {
        public: {
          Complaints: { where: () => ({ first: async () => data.complaint ?? null }) },
          Customers: { where: () => ({ first: async () => data.customer ?? null }) },
          Employees: { where: () => ({ first: async () => data.employee ?? null }) },
          Messages: {
            create: async (row: unknown) => {
              created.push(row);
              return row;
            },
            where: () => ({ orderBy: () => ({ all: async () => [] }) }),
          },
        },
      },
    },
  };
  return { service: new MessagesService(prisma as never), created };
}

// Complaint #3 belongs to customer #3.
const complaint = { complaintId: 3, customerId: 3 };

describe('MessagesService', () => {
  it('says not found when the complaint does not exist', async () => {
    const { service } = makeService(); // no complaint in the fake database

    await expect(
      service.getMessages(999, { sub: 5, role: 'CUSTOMER' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('blocks a customer from reading someone else\'s complaint', async () => {
    // The caller is customer #9, but the complaint belongs to customer #3.
    const { service } = makeService({ complaint, customer: { customerId: 9 } });

    await expect(
      service.getMessages(3, { sub: 5, role: 'CUSTOMER' }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('lets the owning customer read their own complaint', async () => {
    const { service } = makeService({ complaint, customer: { customerId: 3 } });

    const result = await service.getMessages(3, { sub: 2, role: 'CUSTOMER' });

    expect(result).toEqual([]);
  });

  it('lets a manager read any complaint', async () => {
    // No customer in the fake database: a manager is never checked for ownership.
    const { service } = makeService({ complaint });

    const result = await service.getMessages(3, { sub: 1, role: 'MANAGER' });

    expect(result).toEqual([]);
  });

  it('saves a customer message with customerId and no employeeId', async () => {
    const { service, created } = makeService({
      complaint,
      customer: { customerId: 3 },
    });

    await service.createMessage(
      3,
      { sub: 2, role: 'CUSTOMER' },
      { messageText: 'hi' },
    );

    expect(created[0]).toEqual({
      complaintId: 3,
      customerId: 3,
      messageText: 'hi',
    });
  });

  it('saves an employee message with employeeId and no customerId', async () => {
    const { service, created } = makeService({
      complaint,
      employee: { employeeId: 7 },
    });

    await service.createMessage(
      3,
      { sub: 4, role: 'EMPLOYEE' },
      { messageText: 'hi' },
    );

    expect(created[0]).toEqual({
      complaintId: 3,
      employeeId: 7,
      messageText: 'hi',
    });
  });

  it('rejects a message from an employee account with no employee profile', async () => {
    // complaint exists, but there is no employee row for this user
    const { service, created } = makeService({ complaint });

    await expect(
      service.createMessage(
        3,
        { sub: 4, role: 'EMPLOYEE' },
        { messageText: 'hi' },
      ),
    ).rejects.toThrow(ForbiddenException);
    expect(created).toHaveLength(0);
  });

  it('does not save a message when the customer does not own the complaint', async () => {
    const { service, created } = makeService({
      complaint,
      customer: { customerId: 9 },
    });

    await expect(
      service.createMessage(
        3,
        { sub: 5, role: 'CUSTOMER' },
        { messageText: 'sneaky' },
      ),
    ).rejects.toThrow(ForbiddenException);
    expect(created).toHaveLength(0);
  });
});