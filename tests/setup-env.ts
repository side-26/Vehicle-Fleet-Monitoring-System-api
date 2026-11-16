import { vi } from 'vitest';

vi.stubEnv('ADMIN_SESSION_TTL', '2');
vi.stubEnv('ADMIN_ACCESS_TOKEN_TTL', '1');
vi.stubEnv('MONGODB_URI', 'mongodb://127.0.0.1:27017/test');
vi.stubEnv('REDIS_URL', 'redis://127.0.0.1:6379/0');
vi.stubEnv('JWT_ACCESS_SECRET', 'test-access-secret');
vi.stubEnv('JWT_REFRESH_SECRET', 'test-refresh-secret');
