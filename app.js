const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");


const globalErrorHandler = require("./controllers/errorController");
const usersRoutes = require("./routes/api-users");
const productsRoutes = require("./routes/api-products");
const handle404 = require("./middlewares/handle404");
const cors = require("cors");

const app = express();

// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour.",
});
app.use(limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "200kb" }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    //TODO: Might change
    whitelist: ["brand", "rating", "currentBid", "createDate", "price"],
  })
);

app.use(cors({credentials: true, origin: process.env.NODE_ENV === 'development'?'http://localhost:3000':process.env.SITE_URL}));


app.use(cookieParser());

// Serving static files
app.use(express.static(`${__dirname}/public`));

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 2) ROUTES

app.use("/api-users", usersRoutes);
app.use("/api-products", productsRoutes);

app.all("*", handle404);

app.use(globalErrorHandler);

module.exports = app;
