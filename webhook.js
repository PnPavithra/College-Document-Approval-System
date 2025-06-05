const { exec } = require("child_process");

const commands = [
  "docker pull nihamo/crassist-frontend:latest",
  "docker pull nihamo/crassist-backend:latest",
  "docker stop frontend-container || true",
  "docker rm frontend-container || true",
  "docker stop backend-container || true",
  "docker rm backend-container || true",
  "docker run -d --name frontend-container -p 5173:5173 nihamo/crassist-frontend:latest",
  "docker run -d --name backend-container -p 5000:5000 nihamo/crassist-backend:latest"
];

async function runCommandsSequentially(cmds) {
  for (const cmd of cmds) {
    await new Promise((resolve, reject) => {
      console.log(`Running: ${cmd}`);
      exec(cmd, (err, stdout, stderr) => {
        if (err) {
          console.error(`Error running "${cmd}":`, stderr);
          reject(err);
          return;
        }
        console.log(stdout);
        resolve();
      });
    });
  }
  console.log("Deployment successful");
}

runCommandsSequentially(commands).catch(() => {
  console.error("Deployment failed");
});
