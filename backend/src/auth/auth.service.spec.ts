import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service.js';

// Builds the service with a fake database that "finds" the given user
// (or nobody, when you pass null) and a fake JWT service.
function makeService(user: unknown) {
  const prisma = {
    db: {
      orm: {
        public: {
          Users: { where: () => ({ first: async () => user }) },
        },
      },
    },
  };
  const jwtService = { signAsync: vi.fn().mockResolvedValue('fake-token') };
  const service = new AuthService(prisma as never, jwtService as never);
  return { service, jwtService };
}

describe('AuthService.login', () => {
  const user = {
    userId: 2,
    email: 'user2@gmail.com',
    role: 'CUSTOMER',
    passwordHash: bcrypt.hashSync('right-password', 4),
  };

  it('rejects an email that does not exist', async () => {
    const { service } = makeService(null);

    await expect(
      service.login({ email: 'nobody@example.com', password: 'whatever' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rejects a wrong password', async () => {
    const { service } = makeService(user);
    await expect(
      service.login({ email: user.email, password: 'wrong-password' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("correct login with right password returns a token and user info", async () => {
    const { service, jwtService } = makeService(user);
    const result = await service.login({ email: user.email, password: 'right-password' });

    expect(result).toEqual(
      {
    accessToken: 'fake-token',
     user: { userId: 2, email: 'user2@gmail.com', role: 'CUSTOMER' },
    },
    );})
  








});