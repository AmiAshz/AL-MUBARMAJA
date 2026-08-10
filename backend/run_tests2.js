require('jest').run().then(() => {}).catch(e => {
  require('fs').writeFileSync('jest_output.txt', e.toString());
});
