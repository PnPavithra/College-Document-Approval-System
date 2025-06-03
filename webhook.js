const { exec } = require("child_process");

exec(`
  docker pull nihamo/crassist-frontend:latest &&
  docker pull nihamo/crassist-backend:latest &&

  docker stop frontend-container || true &&
  docker rm frontend-container || true &&
  docker run -d --name frontend-container -p 5173:5173 nihamo/crassist-frontend:latest &&

  docker stop backend-container || true &&
  docker rm backend-container || true &&
  docker run -d --name backend-container -p 5000:5000 nihamo/crassist-backend:latest
`, (err, stdout, stderr) => {
  if (err) {
    console.error("Deployment failed:", stderr);
  } else {
    console.log("Deployment successful:\n", stdout);
  }
});
