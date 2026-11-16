export const createSessionScript = `
local indexType = redis.call('TYPE', KEYS[2]).ok
if indexType ~= 'none' and indexType ~= 'zset' then return -2 end
if redis.call('EXISTS', KEYS[1]) == 1 then return 0 end
redis.call('ZREMRANGEBYSCORE', KEYS[2], '-inf', ARGV[5])
if redis.call('ZCARD', KEYS[2]) >= 1000 then return -1 end
redis.call('SET', KEYS[1], ARGV[1], 'NX', 'PX', ARGV[2])
redis.call('ZADD', KEYS[2], ARGV[3], ARGV[4])
local latest = redis.call('ZREVRANGE', KEYS[2], 0, 0, 'WITHSCORES')
redis.call('PEXPIREAT', KEYS[2], latest[2])
return 1`;
