import express from "express";
import { Request, Response, NextFunction } from "express-serve-static-core"
import cookieParser from "cookie-parser";
import cors from "cors";
import { SERVER_PORT } from "./config/config";
import verifyToken from "./middleware/verifyToken";
import { UserServiceImpl } from "./services/userService";
import pool from "./config/db";
import { UserRepositoryDB } from "./repositories/user";
import { UserHandler } from "./handlers/userHandler";
import { AuthServiceImpl } from "./services/authService";
import { JwtServiceImpl } from "./services/jwtService";
import { errorMiddleware } from "./middleware/errorMiddleware";
import { notFoundMiddleware } from "./middleware/404";
import { AuthHandler } from "./handlers/authHandler";

const app = express();

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.get("/", (_req: Request, res: Response, _next: NextFunction) => {
    res.send("Hello, World!");
});

app.get("/ping", (_req: Request, res: Response, _next: NextFunction) => {
    res.send("pong");
});

// user routes
const userRepo = new UserRepositoryDB(pool);
const userSrv = new UserServiceImpl(userRepo);
const userHandler = new UserHandler(userSrv);

const userRouter = express.Router();
userRouter.get("/", userHandler.getUsers.bind(userHandler));
userRouter.get("/:id", userHandler.getUser.bind(userHandler));
userRouter.get("/username/:username", userHandler.getUserByUsername.bind(userHandler));
userRouter.put("/:id", userHandler.updateUser.bind(userHandler));
userRouter.delete("/:id", userHandler.deleteUser.bind(userHandler));

const jwtSrv = new JwtServiceImpl()
const authSrv = new AuthServiceImpl(userSrv, jwtSrv)
const authHndr = new AuthHandler(authSrv)

// auth routes
const authRouter = express.Router();
authRouter.post("/login", authHndr.login.bind(authHndr));
authRouter.post("/register", authHndr.register.bind(authHndr));
authRouter.post("/logout", authHndr.logout.bind(authHndr));
authRouter.post("/refresh-token", authHndr.refreshToken.bind(authHndr));
authRouter.get("/me", verifyToken, authHndr.fetchMe.bind(authHndr));

app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);

// handle 404
app.use(notFoundMiddleware);

// handle errors
app.use(errorMiddleware);

app.listen(SERVER_PORT, () => console.log(`Server is running on port ${SERVER_PORT}`));
