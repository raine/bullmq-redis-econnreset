# bullmq-redis-econnreset

Repro for bullmq-pro not recovering from redis `ECONNRESET`s

1. Run `docker compose up -d` to start redis
2. Run `yarn install`
3. Run `yarn start`
4. While `yarn start` is running, drop network to redis:
   ```sh
   docker network disconnect bullmq-redis-econnreset_default bullmq-redis-econnreset-redis-1
   sleep 1
   docker network connect bullmq-redis-econnreset_default bullmq-redis-econnreset-redis-1
   ```
5. Observe in `yarn start` output that:
   - Redis pings recover from `ECONNRESET`
   - Jobs keep getting added
   - Worker did not recover from `ECONNRESET` and jobs are not getting processed
