import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from './roles.guard.js';

//What a test is, and what describe, it and expect do

function makeContext(user?: { role: string }): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  const reflector = { getAllAndOverride: vi.fn() };
  const guard = new RolesGuard(reflector as unknown as Reflector);

  it('allows a MANAGER on a MANAGER-only route', () => {
    reflector.getAllAndOverride.mockReturnValue(['MANAGER']);
    const result = guard.canActivate(makeContext({ role: 'MANAGER' }));
    expect(result).toBe(true);
  });

  it('blocks a CUSTOMER on a MANAGER-only route', () => {
    reflector.getAllAndOverride.mockReturnValue(['MANAGER']);
    const result = guard.canActivate(makeContext({ role: 'CUSTOMER' }));
    expect(result).toBe(false);
  });
  it('allows access when no roles are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const result = guard.canActivate(makeContext({ role: 'CUSTOMER' }));
    expect(result).toBe(true);
  });

  it('allows an employee on a route that allows MANAGER and EMPLOYEE', () => {
    reflector.getAllAndOverride.mockReturnValue(['MANAGER', 'EMPLOYEE']);
    const result = guard.canActivate(makeContext({ role: 'EMPLOYEE' }));
    expect(result).toBe(true);
  });
  it('blocks a CUSTOMER on a route that allows MANAGER and EMPLOYEE', () => {
    reflector.getAllAndOverride.mockReturnValue(['MANAGER', 'EMPLOYEE']);
    const result = guard.canActivate(makeContext({ role: 'CUSTOMER' }));
    expect(result).toBe(false);
  })
});