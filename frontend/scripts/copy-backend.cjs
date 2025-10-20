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

    // Copy required DLL files to the application directory
    const electronDllSource = path.join(process.cwd(), 'node_modules', 'electron', 'dist');
    const dllFiles = [
      'ffmpeg.dll',
      'd3dcompiler_47.dll',
      'libEGL.dll',
      'libGLESv2.dll',
      'vk_swiftshader.dll',
      'vulkan-1.dll'
    ];

    console.log('Copying required DLL files...');
    dllFiles.forEach(dllFile => {
      const srcPath = path.join(electronDllSource, dllFile);
      const destPath = path.join(appOutDir, dllFile);

      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied DLL file: ${dllFile}`);
      } else {
        console.log(`DLL file not found: ${srcPath}`);
      }
    });

    console.log('Backend files and DLLs copied successfully!');
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