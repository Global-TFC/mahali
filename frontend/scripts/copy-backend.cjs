const fs = require('fs');
const path = require('path');

module.exports = async function(context) {
  try {
    console.log('Running afterPack script to copy backend files...');

    const { appOutDir } = context;

    // Source backend directory
    const backendSource = path.join(process.cwd(), '..', 'backend');
    const backendTarget = path.join(appOutDir, 'backend');

    console.log(`Source: ${backendSource}`);
    console.log(`Target: ${backendTarget}`);

    // Create backend directory if it doesn't exist
    if (!fs.existsSync(backendTarget)) {
      fs.mkdirSync(backendTarget, { recursive: true });
    }

    // Copy essential backend files and directories
    const itemsToCopy = [
      'db.sqlite3',
      'django_server.exe',
      'mahall_backup_restore.exe',
      'manage.py',
      'requirements.txt',
      'mahall_backend',
      'society',
      'media',
      'backup_restore.py'
    ];

    itemsToCopy.forEach(item => {
      const srcPath = path.join(backendSource, item);
      const destPath = path.join(backendTarget, item);

      if (fs.existsSync(srcPath)) {
        if (fs.statSync(srcPath).isDirectory()) {
          copyDirectoryRecursive(srcPath, destPath);
          console.log(`Copied directory: ${item}`);
        } else {
          fs.copyFileSync(srcPath, destPath);
          console.log(`Copied file: ${item}`);
        }
      } else {
        console.log(`Source not found: ${srcPath}`);
      }
    });

    // Copy React frontend build files to Django staticfiles directory
    const frontendDistSource = path.join(process.cwd(), 'dist');
    const staticTarget = path.join(backendTarget, 'staticfiles');

    console.log(`Copying React frontend build files from ${frontendDistSource} to ${staticTarget}`);

    if (fs.existsSync(frontendDistSource)) {
      copyDirectoryRecursive(frontendDistSource, staticTarget);
      console.log('React frontend build files copied successfully!');
    } else {
      console.log(`Frontend dist directory not found: ${frontendDistSource}`);
    }

    console.log('Backend files copied successfully!');
  } catch (error) {
    console.error('Error in afterPack script:', error);
    throw error;
  }
};

function copyDirectoryRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectoryRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}