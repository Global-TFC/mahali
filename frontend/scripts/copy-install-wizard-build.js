import fs from 'fs';
import path from 'path';

// Create install-wizard.html content
const installWizardContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mahall Software - Installation Wizard</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        
        .wizard-container {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            width: 600px;
            padding: 30px;
        }
        
        .wizard-header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .wizard-header h1 {
            color: #333;
            margin-bottom: 10px;
        }
        
        .wizard-step {
            display: none;
        }
        
        .wizard-step.active {
            display: block;
        }
        
        .step-indicator {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }
        
        .step {
            text-align: center;
            flex: 1;
        }
        
        .step-number {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background-color: #e0e0e0;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 10px;
            font-weight: bold;
        }
        
        .step.active .step-number {
            background-color: #007bff;
            color: white;
        }
        
        .step.completed .step-number {
            background-color: #28a745;
            color: white;
        }
        
        .step-label {
            font-size: 14px;
            color: #666;
        }
        
        .step.active .step-label {
            color: #007bff;
            font-weight: bold;
        }
        
        .step.completed .step-label {
            color: #28a745;
        }
        
        .wizard-content {
            margin-bottom: 30px;
        }
        
        .wizard-content h2 {
            color: #333;
            margin-top: 0;
        }
        
        .wizard-content p {
            color: #666;
            line-height: 1.6;
        }
        
        .wizard-buttons {
            display: flex;
            justify-content: space-between;
        }
        
        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }
        
        .btn-prev {
            background-color: #f8f9fa;
            color: #333;
            border: 1px solid #ddd;
        }
        
        .btn-next, .btn-install {
            background-color: #007bff;
            color: white;
        }
        
        .btn-install {
            background-color: #28a745;
        }
        
        .btn:disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }
        
        .backup-option {
            margin: 20px 0;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background-color: #f9f9f9;
        }
        
        .backup-option input {
            margin-right: 10px;
        }
        
        .file-input {
            margin: 10px 0;
            padding: 5px;
        }
        
        .progress-container {
            margin: 20px 0;
        }
        
        .progress-bar {
            width: 100%;
            height: 20px;
            background-color: #e0e0e0;
            border-radius: 10px;
            overflow: hidden;
        }
        
        .progress {
            height: 100%;
            background-color: #007bff;
            width: 0%;
            transition: width 0.3s ease;
        }
        
        .status-message {
            text-align: center;
            margin: 10px 0;
            color: #666;
        }
        
        .error-message {
            color: #dc3545;
            text-align: center;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="wizard-container">
        <div class="wizard-header">
            <h1>Mahall Software</h1>
            <p>Community Management System</p>
        </div>
        
        <div class="step-indicator">
            <div class="step active" id="step1-indicator">
                <div class="step-number">1</div>
                <div class="step-label">Welcome</div>
            </div>
            <div class="step" id="step2-indicator">
                <div class="step-number">2</div>
                <div class="step-label">Backup</div>
            </div>
            <div class="step" id="step3-indicator">
                <div class="step-number">3</div>
                <div class="step-label">Installation</div>
            </div>
        </div>
        
        <div class="wizard-content">
            <div class="wizard-step active" id="step1">
                <h2>Welcome to Mahall Software</h2>
                <p>Thank you for choosing Mahall Software for your community management needs. This installation wizard will guide you through the setup process.</p>
                <p>Before we begin, you have the option to restore data from a previous backup. This is especially useful if you're upgrading from a previous version or migrating to a new computer.</p>
                
                <div class="backup-option">
                    <label>
                        <input type="checkbox" id="restore-checkbox"> 
                        I have a backup file I want to restore
                    </label>
                </div>
            </div>
            
            <div class="wizard-step" id="step2">
                <h2>Restore from Backup</h2>
                <p>Please select your backup file to restore your data. This will restore your database and all media files.</p>
                <p><strong>Note:</strong> Restoring a backup will replace any existing data in the application.</p>
                
                <input type="file" id="backup-file" class="file-input" accept=".zip">
                <div id="restore-error" class="error-message" style="display: none;"></div>
                <button id="restore-btn" class="btn btn-install">Restore Backup</button>
                
                <div class="progress-container" id="restore-progress" style="display: none;">
                    <div class="progress-bar">
                        <div class="progress" id="restore-progress-bar"></div>
                    </div>
                    <div class="status-message" id="restore-status">Preparing to restore...</div>
                </div>
            </div>
            
            <div class="wizard-step" id="step3">
                <h2>Installing Mahall Software</h2>
                <p>We're now ready to install Mahall Software on your computer. The installation will include:</p>
                <ul>
                    <li>Mahall Software application</li>
                    <li>Integrated Django backend server</li>
                    <li>Database with sample data</li>
                    <li>All necessary dependencies</li>
                </ul>
                
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress" id="install-progress"></div>
                    </div>
                    <div class="status-message" id="install-status">Ready to install...</div>
                </div>
                
                <button id="install-btn" class="btn btn-install">Install Now</button>
            </div>
        </div>
        
        <div class="wizard-buttons">
            <button class="btn btn-prev" id="prev-btn" disabled>Previous</button>
            <button class="btn btn-next" id="next-btn">Next</button>
        </div>
    </div>

    <script>
        // Check if we're running in Electron
        const isElectron = typeof require !== 'undefined';
        let ipcRenderer = null;
        
        if (isElectron) {
            const { ipcRenderer: ipc } = require('electron');
            ipcRenderer = ipc;
        }
        
        // Wizard navigation
        let currentStep = 1;
        const totalSteps = 3;
        
        document.getElementById('next-btn').addEventListener('click', nextStep);
        document.getElementById('prev-btn').addEventListener('click', prevStep);
        document.getElementById('restore-checkbox').addEventListener('change', toggleRestoreOption);
        document.getElementById('restore-btn').addEventListener('click', restoreBackup);
        document.getElementById('install-btn').addEventListener('click', installSoftware);
        
        function nextStep() {
            if (currentStep < totalSteps) {
                // Check if we should skip to installation if no backup is selected
                if (currentStep === 1 && !document.getElementById('restore-checkbox').checked) {
                    currentStep = 3; // Skip to installation step
                } else {
                    currentStep++;
                }
                updateWizard();
            }
        }
        
        function prevStep() {
            if (currentStep > 1) {
                currentStep--;
                updateWizard();
            }
        }
        
        function updateWizard() {
            // Hide all steps
            document.querySelectorAll('.wizard-step').forEach(step => {
                step.classList.remove('active');
            });
            
            // Show current step
            document.getElementById(\`step\${currentStep}\`).classList.add('active');
            
            // Update step indicators
            document.querySelectorAll('.step').forEach((step, index) => {
                step.classList.remove('active', 'completed');
                if (index + 1 < currentStep) {
                    step.classList.add('completed');
                } else if (index + 1 === currentStep) {
                    step.classList.add('active');
                }
            });
            
            // Update buttons
            document.getElementById('prev-btn').disabled = (currentStep === 1);
            document.getElementById('next-btn').style.display = (currentStep < totalSteps) ? 'block' : 'none';
        }
        
        function toggleRestoreOption() {
            // This function can be expanded to show/hide restore options
        }
        
        async function restoreBackup() {
            const fileInput = document.getElementById('backup-file');
            if (!fileInput.files.length) {
                showError('Please select a backup file first.');
                return;
            }
            
            const filePath = fileInput.files[0].path || fileInput.files[0].name;
            
            // Show progress
            document.getElementById('restore-progress').style.display = 'block';
            document.getElementById('restore-error').style.display = 'none';
            const progressBar = document.getElementById('restore-progress-bar');
            const statusMessage = document.getElementById('restore-status');
            
            // Simulate restore process
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 10;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    statusMessage.textContent = 'Backup restored successfully!';
                    // Move to installation step after a short delay
                    setTimeout(() => {
                        currentStep = 3;
                        updateWizard();
                    }, 1000);
                }
                progressBar.style.width = progress + '%';
                statusMessage.textContent = getRestoreStatus(progress);
            }, 200);
        }
        
        function showError(message) {
            const errorElement = document.getElementById('restore-error');
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        
        function getRestoreStatus(progress) {
            if (progress < 20) return 'Validating backup file...';
            if (progress < 40) return 'Extracting database...';
            if (progress < 60) return 'Extracting media files...';
            if (progress < 80) return 'Restoring data...';
            return 'Finalizing restore...';
        }
        
        async function installSoftware() {
            const progressBar = document.getElementById('install-progress');
            const statusMessage = document.getElementById('install-status');
            
            // Simulate installation process
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 5;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    statusMessage.textContent = 'Installation completed successfully!';
                    // In a real implementation, this would launch the application
                    setTimeout(async () => {
                        if (isElectron && ipcRenderer) {
                            // Notify main process that installation is complete
                            await ipcRenderer.invoke('complete-installation');
                        } else {
                            alert('Installation completed! The application will now launch.');
                            // Close the installer window
                            window.close();
                        }
                    }, 1000);
                }
                progressBar.style.width = progress + '%';
                statusMessage.textContent = getInstallStatus(progress);
            }, 100);
        }
        
        function getInstallStatus(progress) {
            if (progress < 10) return 'Preparing installation...';
            if (progress < 30) return 'Installing application files...';
            if (progress < 50) return 'Installing Django backend...';
            if (progress < 70) return 'Setting up database...';
            if (progress < 90) return 'Configuring application...';
            return 'Finalizing installation...';
        }
    </script>
</body>
</html>`;

// Write the file to the dist directory
const distPath = path.join(process.cwd(), 'dist');
if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true });
}

const filePath = path.join(distPath, 'install-wizard.html');
fs.writeFileSync(filePath, installWizardContent);
console.log('Created install-wizard.html in dist directory');

// Also copy it to the win-unpacked/resources directory if it exists
const winUnpackedPath = path.join(process.cwd(), 'dist-electron', 'win-unpacked', 'resources');
if (fs.existsSync(winUnpackedPath)) {
    const winUnpackedFilePath = path.join(winUnpackedPath, 'install-wizard.html');
    fs.writeFileSync(winUnpackedFilePath, installWizardContent);
    console.log('Also copied install-wizard.html to win-unpacked/resources directory');
}