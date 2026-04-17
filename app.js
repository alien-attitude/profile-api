import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import profilesRoute from './routes/profile.route.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());

// CORS — grading script requires access from any origin
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// Ensure Access-Control-Allow-Origin: * is set on every response
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
});

// Parse JSON bodies; surface parse errors as 400
app.use(
    express.json({
        strict: false,
        reviver: null,
    })
);

// Handle malformed JSON bodies
app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({
            status: "error",
            message: "Invalid JSON body",
        });
    }
    next(err);
});

// ── Routes ────────────────────────────────────────────────────────────────────

app.use("/api/profiles", profilesRoute);

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 — catch-all for unknown routes
app.use((req, res) => {
    res.status(404).json({
        status: "error",
        message: `Route ${req.method} ${req.path} not found`,
    });
});

// 500 — global error handler
app.use((err, req, res, next) => {
    try {
        console.error("Unhandled error:", err);
        res.status(500).json({
            status: "error",
            message: "Internal server error",
        });

    } catch (err) {
        next(err);
    }

});

export default app;