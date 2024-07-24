import { v4 as uuidv4 } from "uuid";
import { CreatePost, createPostSchema } from "../dtos/CreatePost.dto";
import { UpdatePost, updatePostSchema } from "../dtos/UpdatePost.dto";
import { Post, postSchema } from "../models/post";
import { PostRepository } from "../repositories/post";
import { handleError } from "../utils/errs";
import { BadRequestException, InternalServerErrorException, NotFoundException } from "../utils/exception";
import { ID, idSchema } from "../dtos/Id.dto";
import { objectTo } from "../utils/objectTo";

export interface PostService {
    getPosts(): Promise<Post[]>
    getCurrentUserPosts(id: ID): Promise<Post[]>
    getPost(id: ID): Promise<Post>
    createPost(author_id: ID, createPost: CreatePost): Promise<Post>
    updatePost(id: ID, post: UpdatePost): Promise<Post>
    deletePost(id: ID): Promise<boolean>
}

export class PostServiceImpl implements PostService {
    constructor(private readonly postRepo: PostRepository) { }

    async getPosts(): Promise<Post[]> {
        try {
            const posts = await this.postRepo.findAll();
            return posts;
        } catch (err) {
            console.log("error on post service getPosts");
            throw new InternalServerErrorException()
        }
    }

    async getCurrentUserPosts(id: ID): Promise<Post[]> {
        const idValidate = idSchema.safeParse(id)
        if (!idValidate.success) {
            console.log("error on post service getCurrentUserPosts by id");
            throw new BadRequestException(idValidate.error.message);
        }
        try {
            const posts = await this.postRepo.findAllByAuthorId(idValidate.data);
            return posts;
        } catch (err) {
            console.log("error on post service getCurrentUserPosts", err);
            throw err;
        }
    }

    async getPost(id: ID): Promise<Post> {
        try {
            const post = await this.postRepo.findOne(id);
            if (!post) throw new NotFoundException(`post not found with id ${id}`);
            return post;
        } catch (err) {
            handleError(err, "post service getPost by id")
            throw err
        }
    }

    async createPost(author_id: ID, createPost: CreatePost): Promise<Post> {

        const createPostValidate = createPostSchema.safeParse(createPost)
        if (!createPostValidate.success) {
            console.log(`error on user service create user: ${createPostValidate.error.message}`);
            throw new BadRequestException(createPostValidate.error.message)
        }

        const newId = uuidv4();
        const createdAt = new Date().toISOString();
        const newPost: Post = {
            id: newId,
            author_id,
            content: createPostValidate.data.content,
            created_at: createdAt,
            updated_at: createdAt,
        }

        const newPostValidate = postSchema.safeParse(newPost)
        if (!newPostValidate.success) {
            console.log(newPost);
            console.log(`error on post service create post: ${newPostValidate.error.message}`);
            throw new BadRequestException(newPostValidate.error.message)
        }

        try {
            const createdPost = await this.postRepo.create(newPostValidate.data)
            console.log("createdPost", createdPost)
            return createdPost;
        } catch (err) {
            console.log("error on post service createPost", err)
            throw new InternalServerErrorException()
        }
    }

    async updatePost(id: ID, updatePost: UpdatePost): Promise<Post> {
        const updatePostValidate = updatePostSchema.safeParse(updatePost)
        if (!updatePostValidate.success) {
            console.log("error on post service updatePost by id");
            throw new BadRequestException(updatePostValidate.error.message);
        }
        try {
            const { queryString, updateParams } = objectTo(id, updatePostValidate.data, "posts")
            const updatedPost = await this.postRepo.update(queryString, updateParams);
            if (!updatedPost) throw new NotFoundException(`post not found with id ${id}`);
            return updatedPost;
        } catch (err) {
            console.log("error on post service updatePost")
            throw err;
        }
    }

    async deletePost(id: ID): Promise<boolean> {
        const idValidate = idSchema.safeParse(id)
        if (!idValidate.success) {
            console.log("error on post service deletePost by id");
            throw new BadRequestException(idValidate.error.message);
        }
        try {
            const ok = await this.postRepo.delete(idValidate.data);
            if (!ok) {
                console.log("error on post service delete failed");
                throw new BadRequestException("delete failed");
            }
            return true;
        } catch (err) {
            console.log("error on post service deletePost")
            throw err;
        }
    }
}