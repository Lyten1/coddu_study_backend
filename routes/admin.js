const express = require("express");
const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const router = express.Router();
const dbPath = path.join(__dirname, "../main.db");

router.get("/themes", (req, res) => {
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            return res.status(500).json({ error: "Failed to connect to the database" });
        }
    });

    const query = "SELECT * FROM theme";
    db.all(query, [], (err, rows) => {
        if (err) {
            console.log(err);
            db.close();
            return res.status(500).json({ error: "Failed to retrieve themes" });
        }

        db.close();
        return res.json(rows);
    });

});

// Create a new task
router.post("/task", (req, res) => {
    const { name, description, type, score, start_code, theme_id } = req.body;

    if (!name || !description || !type || !score || !start_code || !theme_id) {
        return res.status(400).json({ error: "Missing required fields: name, description, type, score, start_code, or theme_id" });
    }

    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            return res.status(500).json({ error: "Failed to connect to the database" });
        }
    });


    const query = `
    INSERT INTO task (name, description, type, score, start_code, theme_id)
    VALUES (?, ?, ?, ?, ?, ?)`;


    db.run(query, [name, description, type, score, start_code, theme_id], function (err) {
        if (err) {
            console.log(err);
            db.close();
            return res.status(500).json({ error: "Failed to create task" });
        }

        const taskId = this.lastID;

        const userQuery = "SELECT id FROM user";
        db.all(userQuery, [], (err, users) => {
            if (err) {
                console.log(err);
                db.close();
                return res.status(500).json({ error: "Failed to retrieve users" });
            }

            const insertUserTaskQuery = `
                INSERT INTO user_task (id_task, id_user, complete)
                VALUES (?, ?, ?)`;

            users.forEach((user) => {
                db.run(insertUserTaskQuery, [taskId, user.id, false], (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
            });

            db.close();
            return res.status(201).json({ message: "Task created successfully", taskId });
        });
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

router.get("/tasks", (req, res) => {
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            return res.status(500).json({ error: "Failed to connect to the database" });
        }
    });

    const query = `
        SELECT task.*, theme.name AS theme_name
        FROM task
        LEFT JOIN theme ON task.theme_id = theme.id`;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.log(err);
            db.close();
            return res.status(500).json({ error: "Failed to retrieve tasks" });
        }

        db.close();
        return res.json(rows);
    });
});

// Update a task
router.put("/task/:taskId", (req, res) => {
    const taskId = req.params.taskId;
    const { name, description, score, start_code } = req.body;

    if (!name || !description || !score || !start_code) {
        return res.status(400).json({ error: "Missing required fields: name, description, or theme_id" });
    }

    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            return res.status(500).json({ error: "Failed to connect to the database" });
        }
    });

    const query = `
        UPDATE task
        SET name = ?, description = ?, score = ?, start_code = ?
        WHERE id = ?`;

    db.run(query, [name, description, score, start_code, taskId], function (err) {
        if (err) {
            console.log(err);
            db.close();
            return res.status(500).json({ error: "Failed to update task" });
        }

        db.close();
        if (this.changes > 0) {
            return res.json({ message: "Task updated successfully" });
        } else {
            return res.status(404).json({ error: "Task not found" });
        }
    });
});

// Delete a task
router.delete("/task/:taskId", (req, res) => {
    const taskId = req.params.taskId;


    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            return res.status(500).json({ error: "Failed to connect to the database" });
        }
    });


    const deleteUserTaskQuery = "DELETE FROM user_task WHERE id_task = ?";

    db.run(deleteUserTaskQuery, [taskId], function (err) {
        if (err) {
            console.log(err);
            db.close();
            return res.status(500).json({ error: "Failed to delete user_task records" });
        }

        const deleteTaskQuery = "DELETE FROM task WHERE id = ?";

        db.run(deleteTaskQuery, [taskId], function (err) {
            if (err) {
                console.log(err);
                db.close();
                return res.status(500).json({ error: "Failed to delete task" });
            }

            db.close();
            if (this.changes > 0) {
                return res.json({ message: "Task and associated user_task records deleted successfully" });
            } else {
                return res.status(404).json({ error: "Task not found" });
            }
        });
    });
});

module.exports = router;