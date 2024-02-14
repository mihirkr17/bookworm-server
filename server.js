const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");
const cookieParser = require("cookie-parser");
const sanitizeUrl = require("@braintree/sanitize-url").sanitizeUrl;
const dbConnection = require("./configs/DbConnection");

// Declared Necessary constant
const PORT = process.env.PORT || 5000;
const environments = process.env.NODE_ENV || "development";
const ALLOWED_ORIGINS = ["http://localhost:3000"];
const BASE_CONFIG = {
   development: {
      appUri: process.env.BACKEND_URL_LOCAL || "",
   },
   production: {
      appUri: process.env.BACKEND_URL || "",
   },
};

// Initialized app
const app = express();

// Using middlewares
//Sanitizing URLs
app.use((req, res, next) => {
   req.appUri = BASE_CONFIG[environments].appUri;
   req.url = sanitizeUrl(req.url);
   req.originalUrl = sanitizeUrl(req.originalUrl);
   req.clientOrigin = req?.get("Origin");
   next();
});

// Cors policy
app.use(
   cors({
      // origin: "*",
      origin: function (origin, callback) {
         if (ALLOWED_ORIGINS.indexOf(origin) !== -1 || !origin) {
            return callback(null, true);
         }

         return callback(
            new Error(
               "The CORS policy for this site does not allow access from the specified origin."
            ),
            false
         );
      },
      methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization", "role"],
      credentials: true,
   })
);

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.resolve(__dirname, "public")));

// Routes Declaration Here
// Auth Route
app.use("/api/v1/auth", require("./routes/auth_route"));

// Books route
app.use("/api/v1/books", require("./routes/books_route"));

// Articles Route
app.use("/api/v1/articles", require("./routes/articles_route"));

// users route
app.use("/api/v1/users", require("./routes/users_route"));

app.get("*", (req, res, next) => {
   return res.status(404).json({ message: "Sorry route not found!" });
})

app.post("*", (req, res, next) => {
   return res.status(404).json({ message: "Sorry route not found!" });
})

app.put("*", (req, res, next) => {
   return res.status(404).json({ message: "Sorry route not found!" });
})

app.delete("*", (req, res, next) => {
   return res.status(404).json({ message: "Sorry route not found!" });
})

app.patch("*", (req, res, next) => {
   return res.status(404).json({ message: "Sorry route not found!" });
})

// Global Error Handler
app.use((err, req, res, next) => {
   console.log(err?.message);
   res.status(err?.statusCode || 500).json({ success: false, statusCode: err?.statusCode || 500, message: err?.message || "Internal Error!" });
});



// Starting server here...
(async () => {

   try {
      await dbConnection();

      const server = app.listen(PORT, async () => {
         console.log(`Server running on port: ${PORT}`);
      });

      // If unhandleable errors comes then stop the server
      process.on("unhandledRejection", (error) => {
         console.log(error.name, error?.message);
         server.close(() => process.exit(1));
      });
   } catch (error) {
      console.log(error?.message);
   }
})();
