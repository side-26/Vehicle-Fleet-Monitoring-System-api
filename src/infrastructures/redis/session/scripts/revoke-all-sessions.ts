export const revokeAllSessionsScript = `
local ids = redis.call('ZRANGE', KEYS[1], 0, -1)
local count = 0
for _, id in ipairs(ids) do count = count + redis.call('DEL', ARGV[1] .. id) end
redis.call('DEL', KEYS[1])
return count`;
