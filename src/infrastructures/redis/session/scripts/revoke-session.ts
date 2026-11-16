export const revokeSessionScript = `
local raw = redis.call('GET', KEYS[1])
if not raw then return 0 end
local indexType = redis.call('TYPE', KEYS[2]).ok
if indexType ~= 'none' and indexType ~= 'zset' then return redis.error_reply('Invalid session index type') end
local session = cjson.decode(raw)
redis.call('DEL', KEYS[1])
redis.call('ZREM', KEYS[2], session.id)
return 1`;
