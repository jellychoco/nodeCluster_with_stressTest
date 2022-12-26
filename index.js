import cluster from "node:cluster";
import http from "node:http";
import { cpus } from "node:os";
import process from "node:process";

if (cluster.isPrimary) {
  // Keep track of http requests
  let numReqs = 0;

  // Start workers and listen for messages containing notifyRequest
  const numCPUs = cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork();

    worker.on("message", (msg) => {
      if (msg.cmd === "notifyRequest") {
        numReqs += 1;
        console.log("current worker ID =", worker.id, "/// count", numReqs);
      }
    });
  }
} else {
  // Worker processes have a http server.
  http
    .Server((req, res) => {
      res.writeHead(200);
      res.end("hello world\n");

      // Notify primary about the request
      process.send({ cmd: "notifyRequest" });
    })
    .listen(8000);
}
