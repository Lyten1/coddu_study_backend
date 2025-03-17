const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");
const { connected } = require("process");

const app = express();
app.use(cors());
app.use(express.json());


app.post("/test", (req, res) => {
    const code = req.body.modifiedCode;

    const folderPath = path.join(__dirname, "tasks", "task_1");

    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    const filePath = path.join(folderPath, "temp.c");
    fs.writeFileSync(filePath, code);

    const compileCommand = `gcc -o ${folderPath}/tests ${folderPath}/temp.c ${folderPath}/tests.c`;

    exec(compileCommand, (error, stdout, stderr) => {
        if (error) {
            return res.json({ output: stderr });
        } else {
            // Run the compiled program
            exec(`${folderPath}/tests`, (runError, runStdout, runStderr) => {
                if (runError) {
                    return res.json({ output: runStderr });
                }
                return res.json({ output: runStdout });
            });
        }
    });
});

app.post("/run", (req, res) => {
    const code = req.body.code;

    const folderPath = path.join(__dirname, "tasks", "task_1");

    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    const filePath = path.join(folderPath, "temp.c");
    fs.writeFileSync(filePath, code);

    const compileCommand = `gcc -o ${folderPath}/temp ${folderPath}/temp.c`;

    exec(compileCommand, (error, stdout, stderr) => {
        if (error) {
            return res.json({ output: stderr });
        } else {
            exec(`${folderPath}/temp`, (runError, runStdout, runStderr) => {
                if (runError) {
                    return res.json({ output: runStderr });
                }
                return res.json({ output: runStdout });

            });
        }
    });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

