import { Request, Response, NextFunction } from "express-serve-static-core";
import { PostService } from "../services/postService";
import { ApiResponse } from "../dtos/ApiResponse.dto";
import { Post } from "../models/post";
import { ID, idSchema } from "../dtos/Id.dto";
import { BadRequestException } from "../utils/exception";
import { CreatePost, createPostSchema } from "../dtos/CreatePost.dto";
import { updatePostSchema } from "../dtos/UpdatePost.dto";

export class PostHandler {
    constructor(private readonly postSrv: PostService) { }

    async getPosts(_req: Request, res: Response<ApiResponse<Post[]>>, next: NextFunction) {
        try {
            const posts = await this.postSrv.getPosts();
            res.json({ success: true, data: posts });
        } catch (err) {
            next(err);
        }
    }

    async getPost(req: Request<{ id: string }>, res: Response<ApiResponse<Post>>, next: NextFunction) {
        const idValidate = idSchema.safeParse(req.params.id);
        if (!idValidate.success) {
            console.log("error on post handler getPost id is not valid");
            return next(new BadRequestException("id is not valid"));
        }
        try {
            const post = await this.postSrv.getPost(idValidate.data);
            res.json({ success: true, data: post })
        } catch (err) {
            next(err);
        }
    }

    async createPost(req: Request, res: Response, next: NextFunction) {
        const idValidate = idSchema.safeParse(req.params.id);
        if (!idValidate.success) {
            console.log("error on post handler getPost id is not valid");
            return next(new BadRequestException("id is not valid"));
        }

        const createPostValidate = createPostSchema.safeParse(req.body);
        if (!createPostValidate.success) {
            console.log("error on post handler createPost req body", createPostValidate.error);
            return next(new BadRequestException(createPostValidate.data))
        }

        try {
            const createdPost = this.postSrv.createPost(idValidate.data, createPostValidate.data);
            res.status(201).json({ success: true, data: createdPost })
        } catch (err) {
            next(err);
        }
    }

    async updatePost(req: Request, res: Response<ApiResponse<Post>>, next: NextFunction) {
        const idValidate = idSchema.safeParse(req.params.id);
        if (!idValidate.success) {
            console.log("error on post handler getPost id is not valid");
            return next(new BadRequestException("id is not valid"));
        }

        const updatePostValidate = updatePostSchema.safeParse(req.body);
        if (!updatePostValidate.success) {
            console.log("error on post handler updatePost", updatePostValidate.error.message);
            return next(new BadRequestException(updatePostValidate.error.message))
        }

        try {
            const updatedPost = await this.postSrv.updatePost(idValidate.data, updatePostValidate.data);
            res.json({ success: true, data: updatedPost });
        } catch (err) {
            next(err);
        }
    }

    async deletePost(req: Request<{ id: ID }>, res: Response<ApiResponse<undefined>>, next: NextFunction) {
        const idValidate = idSchema.safeParse(req.params.id);
        if (!idValidate.success) {
            console.log("error on post handler ", idValidate.error.message);
            return next(idValidate.error.message);
        }

        try {
            const ok = await this.postSrv.deletePost(idValidate.data);
            res.json({ success: true, message: "delete successfully" })
        } catch (err) {
            next(err);
        }
    }

}
