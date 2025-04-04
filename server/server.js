const express = require("express");
const multer = require("multer");
const cors = require("cors");
const pdfParse = require("pdf-parse");
const app = express();

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        const text = await pdfParse(req.file.buffer);
        res.json({ text: text.text });
    } catch (error) {
        res.status(500).json({ error: "Failed to extract text" });
    }
});

app.listen(5000, () => console.log("Server running on port 5000"));
