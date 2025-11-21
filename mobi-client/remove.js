// remove-unimported.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// chạy unimported và lấy output JSON
const output = execSync('npx unimported --json', { encoding: 'utf-8' });
const data = JSON.parse(output);

// danh sách file unimported
const files = data.unimportedFiles;

files.forEach(file => {
  // giữ tất cả file trong src/services
  if (!file.startsWith('src/services/')) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('Deleted:', file);
    }
  }
});
