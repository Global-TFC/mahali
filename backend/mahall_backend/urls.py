from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

# Simple view to return a basic response for the root URL with backup/restore options
def home_view(request):
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Mahali Backend API</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background-color: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #333; text-align: center; }
            .info { background-color: #e7f3ff; padding: 15px; border-radius: 4px; margin: 20px 0; }
            .backup-section { background-color: #f9f9f9; padding: 20px; border-radius: 4px; margin: 20px 0; }
            .backup-section h2 { color: #555; }
            .btn { background-color: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; text-decoration: none; display: inline-block; margin: 5px; }
            .btn:hover { background-color: #0056b3; }
            .btn-secondary { background-color: #6c757d; }
            .btn-secondary:hover { background-color: #545b62; }
            .btn-success { background-color: #28a745; }
            .btn-success:hover { background-color: #1e7e34; }
            .firebase-config-section { background-color: #fff3cd; padding: 20px; border-radius: 4px; margin: 20px 0; border: 1px solid #ffeaa7; }
            .firebase-config-section h2 { color: #856404; margin-top: 0; }
            .firebase-config-textarea { width: 100%; min-height: 150px; padding: 12px; border-radius: 6px; border: 1px solid #ddd; font-family: monospace; font-size: 14px; resize: vertical; }
            .message { margin-top: 15px; padding: 12px; border-radius: 6px; font-weight: 500; }
            .message.success { background: rgba(46, 204, 113, 0.2); color: #27ae60; border: 1px solid rgba(46, 204, 113, 0.3); }
            .message.error { background: rgba(231, 76, 60, 0.2); color: #c0392b; border: 1px solid rgba(231, 76, 60, 0.3); }
            .form-group { margin-bottom: 15px; }
            .form-group label { display: block; margin-bottom: 5px; font-weight: 500; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Mahali Backend API Server</h1>
            
            <div class="info">
                <p><strong>API Status:</strong> Running</p>
                <p><strong>API Endpoint:</strong> <a href="/api/">/api/</a></p>
                <p>Access API endpoints at <code>/api/</code></p>
            </div>
            
            <div class="firebase-config-section">
                <h2>Firebase Configuration</h2>
                <p>Configure Firebase connection for Member Request functionality:</p>
                
                <div class="form-group">
                    <label for="firebaseConfig">Firebase Config JSON:</label>
                    <textarea id="firebaseConfig" class="firebase-config-textarea" placeholder='{"apiKey": "your-api-key", "authDomain": "your-auth-domain", "projectId": "your-project-id", ...}'></textarea>
                </div>
                
                <button class="btn btn-warning" onclick="saveFirebaseConfig()">Save Firebase Config</button>
                
                <div id="firebaseStatus" style="margin-top: 15px;"></div>
            </div>
            
            <div class="backup-section">
                <h2>Backup & Restore</h2>
                <p>Manage your Mahali application data:</p>
                
                <button class="btn btn-success" onclick="createBackup()">Create Backup</button>
                <button class="btn" onclick="restoreBackup()">Restore Backup</button>
                
                <div id="backupStatus" style="margin-top: 20px; padding: 10px; display: none;"></div>
                
                <div style="margin-top: 20px;">
                    <h3>Upload Backup File for Restore</h3>
                    <input type="file" id="backupFile" accept=".zip" />
                    <button class="btn" onclick="uploadAndRestoreBackup()">Upload & Restore</button>
                </div>
            </div>
            
            <div class="backup-section">
                <h2>Database Management</h2>
                <p>Reset database to clean state:</p>
                
                <button class="btn btn-secondary" onclick="resetDatabase()" style="background-color: #dc3545;">Reset Database (Clean Start)</button>
            </div>
        </div>
        
        <script>
            function showMessage(elementId, message, isError = false) {
                const statusDiv = document.getElementById(elementId);
                statusDiv.textContent = message;
                statusDiv.style.display = 'block';
                statusDiv.className = 'message ' + (isError ? 'error' : 'success');
            }
            
            function saveFirebaseConfig() {
                const firebaseConfig = document.getElementById('firebaseConfig').value;
                const statusElement = 'firebaseStatus';
                
                // Validate JSON if not empty
                if (firebaseConfig.trim()) {
                    try {
                        JSON.parse(firebaseConfig);
                    } catch (e) {
                        showMessage(statusElement, 'Invalid JSON format: ' + e.message, true);
                        return;
                    }
                }
                
                // Send to server
                fetch('/api/save-firebase-config/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ firebase_config: firebaseConfig })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showMessage(statusElement, 'Firebase configuration saved successfully!');
                    } else {
                        showMessage(statusElement, 'Error: ' + data.error, true);
                    }
                })
                .catch(error => {
                    showMessage(statusElement, 'Error saving Firebase config: ' + error.message, true);
                });
            }
            
            function createBackup() {
                const statusElement = 'backupStatus';
                showMessage(statusElement, 'Creating backup...');
                
                fetch('/api/obligations/export_data/', {
                    method: 'POST'
                })
                .then(response => {
                    if (response.ok) {
                        return response.blob();
                    } else {
                        throw new Error('Backup failed');
                    }
                })
                .then(blob => {
                    // Create download link
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'mahall_backup_' + new Date().toISOString().slice(0, 19).replace(/:/g, '-') + '.zip';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    
                    showMessage(statusElement, 'Backup created and downloaded successfully!');
                })
                .catch(error => {
                    showMessage(statusElement, 'Error creating backup: ' + error.message, true);
                });
            }
            
            function restoreBackup() {
                showMessage('backupStatus', 'Please select a backup file and click "Upload & Restore"');
            }
            
            function uploadAndRestoreBackup() {
                const fileInput = document.getElementById('backupFile');
                const statusElement = 'backupStatus';
                
                if (!fileInput.files.length) {
                    showMessage(statusElement, 'Please select a backup file first', true);
                    return;
                }
                
                const file = fileInput.files[0];
                if (!file.name.endsWith('.zip')) {
                    showMessage(statusElement, 'Please select a ZIP file', true);
                    return;
                }
                
                showMessage(statusElement, 'Uploading and restoring backup...');
                
                const formData = new FormData();
                formData.append('zip_file', file);
                
                fetch('/api/obligations/import_data/', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.message) {
                        showMessage(statusElement, data.message);
                    } else if (data.error) {
                        showMessage(statusElement, 'Error: ' + data.error, true);
                    }
                })
                .catch(error => {
                    showMessage(statusElement, 'Error restoring backup: ' + error.message, true);
                });
            }
            
            function resetDatabase() {
                if (confirm('Are you sure you want to reset the database? This will delete all data.')) {
                    showMessage('backupStatus', 'Database reset functionality is available in the desktop application.');
                }
            }
        </script>
    </body>
    </html>
    """
    return HttpResponse(html_content.encode('utf-8'))

# API endpoint to save Firebase configuration
@csrf_exempt
def save_firebase_config(request):
    if request.method == 'POST':
        try:
            # Import here to avoid circular imports
            from django.apps import apps
            AppSettings = apps.get_model('society', 'AppSettings')
            
            data = json.loads(request.body)
            firebase_config = data.get('firebase_config', '')
            
            # Get or create AppSettings instance
            if AppSettings.objects.exists():
                settings_instance = AppSettings.objects.first()
            else:
                settings_instance = AppSettings.objects.create(theme='light')
            
            # Update Firebase config
            settings_instance.firebase_config = firebase_config
            settings_instance.save()
            
            return JsonResponse({'success': True, 'message': 'Firebase configuration saved successfully'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    else:
        return JsonResponse({'success': False, 'error': 'Method not allowed'})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('society.urls')),
    path('api/save-firebase-config/', save_firebase_config, name='save_firebase_config'),
    # In production (Electron app), we don't serve the frontend through Django
    # The React frontend is served statically by Electron
    path('', home_view, name='home'),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Serve static files in production
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)