const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { exec } = require("child_process");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/compile", (req, res) => {
    console.log("check compile");
    const code = req.body.code;
    fs.writeFileSync("temp.c", code);

    exec("gcc temp.c -o temp.out && ./temp.out", (error, stdout, stderr) => {
        if (error) {
            res.json({ output: stderr });
        } else {
            res.json({ output: stdout });
        }
    });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

