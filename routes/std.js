const express = require("express");
const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const router = express.Router();
const dbPath = path.join(__dirname, "../main.db");


router.post("/test", (req, res) => {
    const code = req.body.modifiedCode;
    const taskStr = req.body.task ? req.body.task.toString() : -1;
    const task = req.body.task;
    const user = req.body.user;


    if (taskStr === -1) {
        return res.json({ output: "Task not found" });
    }

    const folderPath = path.join(__dirname, "../tasks", taskStr);

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
            exec(`${folderPath}/tests`, (runError, runStdout, runStderr) => {
                if (runError) {
                    return res.json({ output: runStderr });
                }
                fs.unlinkSync(filePath);
                fs.unlinkSync(`${folderPath}/tests`);
                const status = runStdout.match(/status: (SUCCESS|FAILED)/)[1];

                const db = new sqlite3.Database(dbPath, (err) => {
                    if (err) {
                        console.error("Failed to connect to the database:", err);
                        return res.status(500).json({ error: "Database connection error" });
                    }
                });

                const updateQuery = `
                    UPDATE user_task
                    SET complete = true
                    WHERE id_user = ? AND id_task = ?
                `;

                db.run(updateQuery, [user, task], (err) => {
                    if (err) {
                        console.error("Failed to update user_task:", err);
                    }
                    db.close();
                });
                runStdout = runStdout.replace(/status: (SUCCESS|FAILED)\n/, "");
                return res.json({ output: runStdout });
            });
        }
    });
});

// Route: /run
router.post("/run", (req, res) => {
    const code = req.body.code;
    const task = req.body.task;

    const folderPath = path.join(__dirname, "../tasks", task);

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
                fs.unlinkSync(filePath);
                fs.unlinkSync(`${folderPath}/temp`);
                return res.json({ output: runStdout });
            });
        }
    });
});


router.get("/task/:taskId", (req, res) => {
    const taskId = req.params.taskId;

    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            return res.status(500).json({ error: "Failed to connect to the database" });
        }
    });

    const query = "SELECT * FROM task WHERE id = ?";
    db.get(query, [taskId], (err, row) => {
        if (err) {
            console.log(err);
            db.close();
            return res.status(500).json({ error: "Failed to retrieve task" });
        }

        db.close();
        if (row) {
            return res.json(row);
        } else {
            return res.status(404).json({ error: "Task not found" });
        }
    });
});

// Route: /tasks
router.get("/tasks", (req, res) => {
    const userId = req.query.userId; // Get userId from query parameters

    if (!userId) {
        return res.status(400).json({ error: "Missing userId parameter" });
    }

    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            return res.status(500).json({ error: "Failed to connect to the database" });
        }
    });

    const query = `
        SELECT 
            task.*, 
            user_task.complete, 
            theme.name AS theme_name,
            theme.position AS theme_position
        FROM user_task
        INNER JOIN task ON user_task.id_task = task.id
        LEFT JOIN theme ON task.theme_id = theme.id
        WHERE user_task.id_user = ?
    `;

    db.all(query, [userId], (err, rows) => {
        if (err) {
            console.log(err);
            db.close();
            return res.status(500).json({ error: "Failed to retrieve tasks" });
        }

        db.close();
        return res.json(rows);
    });
});

module.exports = router;