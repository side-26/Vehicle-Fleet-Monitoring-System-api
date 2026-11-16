export const rotateSessionScript = `
local raw = redis.call('GET', KEYS[1])
if not raw then return 'SESSION_NOT_FOUND' end
local indexType = redis.call('TYPE', KEYS[2]).ok
if indexType ~= 'none' and indexType ~= 'zset' then return redis.error_reply('Invalid session index type') end
local session = cjson.decode(raw)
local now = tonumber(ARGV[1])
if tonumber(session.expiresAt) <= now then return 'SESSION_EXPIRED' end
local used = ARGV[2] .. ARGV[3] .. ':' .. ARGV[4]
if redis.call('EXISTS', used) == 1 then
  redis.call('DEL', KEYS[1])
  redis.call('ZREM', KEYS[2], session.id)
  return 'REFRESH_TOKEN_REUSED'
end
if session.refreshTokenHash ~= ARGV[4] or ARGV[4] == ARGV[5] then return 'INVALID_REFRESH_TOKEN' end
if redis.call('EXISTS', ARGV[2] .. ARGV[3] .. ':' .. ARGV[5]) == 1 then return 'INVALID_REFRESH_TOKEN' end
local ttl = redis.call('PTTL', KEYS[1])
if ttl <= 0 then return 'SESSION_EXPIRED' end
redis.call('SET', used, '1', 'PX', math.min(ttl, tonumber(session.expiresAt) - now))
session.refreshTokenHash = ARGV[5]
session.updatedAt = now
redis.call('SET', KEYS[1], cjson.encode(session), 'KEEPTTL')
return 'ROTATED'`;
