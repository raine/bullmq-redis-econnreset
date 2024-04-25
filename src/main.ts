import { QueuePro, WorkerPro, QueueEventsPro } from "@taskforcesh/bullmq-pro";
import Redis from "ioredis";

const connection = new Redis({
  host: "localhost",
  port: 19900,
  maxRetriesPerRequest: null,
});

connection.on("connect", () => console.log("Redis connected!"));
connection.on("ready", () => console.log("Redis ready!"));
connection.on("error", (err) => console.error("Redis error:", err));
connection.on("end", () => console.log("Redis connection ended"));
connection.on("reconnecting", () => console.log("Redis reconnecting..."));

const queue = new QueuePro("test-queue", {
  connection,
});

const worker = new WorkerPro(
  "test-queue",
  async (job) => {
    console.log(`Processing job ${job.id}`);
    return { result: `Processed job ${job.id}` };
  },
  { connection }
);

const queueEvents = new QueueEventsPro("queue", { connection });

queueEvents.on("completed", (job) => {
  console.log(`Job ${job.jobId} has completed!`);
});

queueEvents.on("failed", (job, err) => {
  console.error(`Job ${job.jobId} has failed with error ${err}`);
});

queueEvents.on("waiting", ({ jobId }) => {
  console.log(`Job ${jobId} is waiting to be processed`);
});

worker.on("error", (error) => {
  console.error("Worker error:", error);
});

function addJob() {
  return queue
    .add("job", {}, { removeOnComplete: true })
    .then((job) => {
      console.log(`Added job ${job.id}`);
    })
    .catch((err) => {
      console.error("Failed to add job:", err);
    });
}

setInterval(async () => {
  await addJob();
  await pingRedis();
}, 1000);

function pingRedis() {
  return connection
    .ping()
    .then((result) => {
      console.log("Redis PING response:", result);
    })
    .catch((err) => {
      console.error("Error pinging Redis:", err);
    });
}

process.on("uncaughtException", (error) => {
  console.error("Unhandled exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled jejection at:", promise, "reason:", reason);
});
