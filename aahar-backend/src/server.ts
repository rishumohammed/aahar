import http           from "http";
import app            from "./app.js";
import { initSocket } from "./socket.js";
import { startCronJobs } from "./jobs/enquiry.jobs.js";

const PORT       = process.env.PORT ?? 5000;
const httpServer = http.createServer(app);

initSocket(httpServer);
startCronJobs();

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
