const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { spawn } = require("child_process");

const app = express();
const PORT = 5001;

app.use(cors());
app.use(bodyParser.json());

app.post("/generate", (req, res) => {
    const { url, size } = req.body;

    if (!url) {
        return res.status(400).json({ error: "File URL is required" });
    }

    // Spawn a Python process and pass the URL and size as arguments
    const pythonProcess = spawn("python", ["generation_algo.py", url, size]);

    let output = "";

    pythonProcess.stdout.on("data", (data) => {
        output += data.toString();
    });

    pythonProcess.stderr.on("data", (error) => {
        console.error("Error:", error.toString());
    });

    pythonProcess.on("close", (code) => {
        if (code === 0) {
            try {
                console.log("Python output:", output);
                const result = JSON.parse(output.trim()); // Parse the JSON output
                res.json(result);
            } catch (error) {
                console.error("Error parsing Python output:", error);
                res.status(500).json({ error: "Failed to parse Python output" });
            }
        } else {
            res.status(500).json({ error: "Python script failed" });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
