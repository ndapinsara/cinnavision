import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import {connectDB} from "./lib/db.js"


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); //allow parsing of JSON bodies in requestsn

app.use("/api/auth", authRoutes);

//cinna1234= password
app.listen(PORT, () => {
    console.log("Server  running on http://localhost:" + PORT);

    
    connectDB();
});

