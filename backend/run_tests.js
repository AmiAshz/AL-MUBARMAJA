const { exec } = require('child_process');
const fs = require('fs');

exec('npx jest', (error, stdout, stderr) => {
  fs.writeFileSync('jest_output.txt', `STDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`);
});
