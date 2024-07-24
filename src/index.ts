import express from "express";
import { Request, Response, NextFunction } from "express-serve-static-core"
import cookieParser from "cookie-parser";
import cors from "cors";
import verifyToken from "./middleware/verifyToken";
import pool from "./config/db";
import { SERVER_PORT } from "./config/config";
import { UserServiceImpl } from "./services/userService";
import { UserRepositoryDB } from "./repositories/user";
import { UserHandler } from "./handlers/userHandler";
import { AuthServiceImpl } from "./services/authService";
import { JwtServiceImpl } from "./services/jwtService";
import { errorMiddleware } from "./middleware/errorMiddleware";
import { notFoundMiddleware } from "./middleware/404";
import { AuthHandler } from "./handlers/authHandler";
import { PostRepositoryDB } from "./repositories/post";
import { PostServiceImpl } from "./services/postService";
import { PostHandler } from "./handlers/postHandler";

const app = express();

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.get("/checkpoint", (_req: Request, res: Response, _next: NextFunction) => {
    res.status(200);
});

// user routes
const userRepo = new UserRepositoryDB(pool);
const userSrv = new UserServiceImpl(userRepo);
const userHandler = new UserHandler(userSrv);

const userRouter = express.Router();
userRouter.get("/", userHandler.getUsers.bind(userHandler));
userRouter.get("/username/:username", userHandler.getUserByUsername.bind(userHandler));
userRouter.put("/:id", userHandler.updateUserByParam.bind(userHandler));
userRouter.delete("/:id", userHandler.deleteUser.bind(userHandler));
userRouter.get("/me", verifyToken, userHandler.getCurrentUser.bind(userHandler));
userRouter.get("/:id", userHandler.getUser.bind(userHandler));
userRouter.put("/me", verifyToken, userHandler.updateCurrentUser.bind(userHandler));

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

const postRepo = new PostRepositoryDB(pool);
const postSrv = new PostServiceImpl(postRepo);
const postHandler = new PostHandler(postSrv);

// post routes
const postRouter = express.Router();
postRouter.get("/", postHandler.getPosts.bind(postHandler));
postRouter.get("/:id", postHandler.getPost.bind(postHandler));
postRouter.post("/", postHandler.createPost.bind(postHandler));
postRouter.put("/:id", postHandler.updatePost.bind(postHandler));
postRouter.delete("/:id", postHandler.deletePost.bind(postHandler));
postRouter.get("/me", postHandler.getCurrentUserPosts.bind(postHandler));

app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/posts", verifyToken, postRouter);
// handle 404
app.use(notFoundMiddleware);

// handle errors
app.use(errorMiddleware);

app.listen(SERVER_PORT, () => console.log(`Server is running on port ${SERVER_PORT}`));
