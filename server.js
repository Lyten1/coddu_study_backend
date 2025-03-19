const express = require("express");
const cors = require("cors");
const stdRoutes = require("./routes/std");
const adminRoutes = require("./routes/admin");

const app = express();
app.use(cors());
app.use(express.json());


app.use("/", stdRoutes);
app.use("/admin", adminRoutes);


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

