
import dotenv from "dotenv";
dotenv.config();
import express from "express";
const app = express();
import cors from "cors"
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import commentRoutes from "./routes/comment.route.js";
import ConnectDB from "./lib/connectDB.js";




// define port
const PORT = process.env.PORT;


// use a cookie-parser middleware to parse the cookies
app.use(cookieParser());


// json middleware
app.use(express.json());

// allow cross-origin requests
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", 
    "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


// setup cors
const allowedOrigins = ["http://localhost:3000", "http://localhost:5173","http://localhost:5174"];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true); // Allow the request
      } else {
        callback(new Error("Not allowed by CORS")); 
      }
    },
    credentials: true,
  })
);


// routes
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/comments", commentRoutes);

// error middleware
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    message: error.message || "Something went wrong.",
    status: error.status,
    stack: error.stack,
  });
});

app.listen(PORT, () => {
  ConnectDB();
  console.log(`Server is running on PORT ${PORT}`);
});

export default app;
