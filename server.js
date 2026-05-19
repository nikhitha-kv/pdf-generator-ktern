const express = require('express');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON and urlencoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Detect the appropriate Python executable path
const getPythonPath = () => {
    const { execSync } = require('child_process');
    
    // Windows virtualenv path
    const winVenvPath = path.join(__dirname, 'venv', 'Scripts', 'python.exe');
    // Unix virtualenv path
    const unixVenvPath = path.join(__dirname, 'venv', 'bin', 'python');
    
    if (fs.existsSync(winVenvPath)) {
        try {
            // Verify if the venv Python is actually functional
            execSync(`"${winVenvPath}" --version`, { stdio: 'ignore' });
            console.log(`Using Windows virtualenv Python: ${winVenvPath}`);
            return winVenvPath;
        } catch (err) {
            console.warn(`[Express] Windows virtualenv Python found at ${winVenvPath} but failed to execute. Falling back to system Python.`);
        }
    }
    
    if (fs.existsSync(unixVenvPath)) {
        try {
            // Verify if the venv Python is actually functional
            execSync(`"${unixVenvPath}" --version`, { stdio: 'ignore' });
            console.log(`Using Unix virtualenv Python: ${unixVenvPath}`);
            return unixVenvPath;
        } catch (err) {
            console.warn(`[Express] Unix virtualenv Python found at ${unixVenvPath} but failed to execute. Falling back to system Python.`);
        }
    }
    
    console.log('Using system "python"');
    return 'python';
};

const pythonPath = getPythonPath();

// Serve static files from static directory
app.use('/static', express.static(path.join(__dirname, 'static')));

// Serve generated PDFs directly from generated_pdfs directory on the download endpoint
app.use('/download', express.static(path.join(__dirname, 'generated_pdfs')));

// Root route - serve index.html dynamically to replace Flask url_for placeholders
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'templates', 'index.html');
    fs.readFile(indexPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error loading index.html:', err);
            return res.status(500).send('Error loading page');
        }
        
        // Dynamically replace Jinja2 url_for patterns to point to Express static endpoints
        let html = data.replace(/\{\{\s*url_for\('static',\s*filename='style\.css'\)\s*\}\}/g, '/static/style.css');
        html = html.replace(/\{\{\s*url_for\('static',\s*filename='script\.js'\)\s*\}\}/g, '/static/script.js');
        
        res.send(html);
    });
});

// PDF Generation Endpoint
app.post('/generate', (req, res) => {
    const payload = JSON.stringify(req.body);
    
    console.log(`[Express] Spawning PDF generator script for topic: "${req.body.topic || 'Unknown'}"`);
    
    // Spawn python child process
    const pyProcess = spawn(pythonPath, [path.join(__dirname, 'pdf_generator.py')]);
    
    let stdoutData = '';
    let stderrData = '';
    
    pyProcess.stdout.on('data', (data) => {
        stdoutData += data.toString();
    });
    
    pyProcess.stderr.on('data', (data) => {
        stderrData += data.toString();
        // Print Python stderr to Express console for debugging
        process.stderr.write(data);
    });
    
    pyProcess.on('close', (code) => {
        console.log(`[Express] PDF generator process exited with code ${code}`);
        if (code !== 0) {
            console.error(`[Express] Error output: ${stderrData}`);
            return res.status(500).json({ 
                success: false, 
                error: `PDF generation failed. Python script exited with error code ${code}.` 
            });
        }
        
        try {
            const result = JSON.parse(stdoutData.trim());
            if (result.success) {
                return res.json(result);
            } else {
                return res.status(500).json({ success: false, error: result.error || 'Unknown error occurred.' });
            }
        } catch (err) {
            console.error('[Express] Failed to parse stdout JSON:', stdoutData);
            return res.status(500).json({ 
                success: false, 
                error: 'Internal Server Error: Failed to parse compilation response.' 
            });
        }
    });
    
    // Write request payload to Python's stdin and end the input stream
    pyProcess.stdin.write(payload);
    pyProcess.stdin.end();
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  KTERN ENTERPRISE AI DOCUMENT WORKSPACE IS RUNNING    `);
    console.log(`  Local URL: http://localhost:${PORT}                 `);
    console.log(`=======================================================`);
});
