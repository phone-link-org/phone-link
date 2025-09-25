import { Router } from "express";
import { AppDataSource } from "../db";
import type { PostListDto } from "../../../shared/post.types";
import { Post } from "../typeorm/posts.entity";
import { Category } from "../typeorm/categories.entity";
import { PostCategory } from "../typeorm/postCategories.entity";

const router = Router();

// 특정 카테고리의 게시글 목록 조회
router.get("/:category", async (req, res) => {
  try {
    const { category } = req.params;

    // 카테고리명으로 게시글 목록 조회
    const query = `
      SELECT 
        p.id AS id,
        p.title AS title,
        p.thumbnail_url AS thumbnailUrl,
        p.view_count AS viewCount,
        p.like_count AS likeCount,
        p.created_at AS createdAt,
        u.id AS authorId,
        u.nickname AS authorNickname,
        u.profile_image_url AS authorProfileImageUrl,
        c.id AS categoryId,
        c.name AS categoryName,
        (SELECT COUNT(id) FROM comments WHERE post_id = p.id) AS commentCount
      FROM categories c 
      JOIN post_categories pc ON c.id = pc.category_id 
      JOIN posts p ON pc.post_id = p.id 
      JOIN users u ON p.user_id = u.id 
      WHERE c.name = ? AND p.is_deleted = false
      ORDER BY p.created_at DESC
    `;

    const posts: PostListDto[] = await AppDataSource.query(query, [category]);

    res.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    console.error("게시글 목록 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "게시글 목록을 불러오는 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
});

router.post("/write/:category", async (req, res) => {
  const { category } = req.params;
  const { title, content, userId } = req.body;

  try {
    const categoryEntity = await AppDataSource.getRepository(Category).findOne({ where: { name: category } });
    if (!categoryEntity) {
      return res.status(404).json({ message: "존재하지 않은 카테고리입니다." });
    }

    const newPost = new Post();
    newPost.title = title;
    newPost.content = content;
    newPost.userId = userId;
    newPost.viewCount = 0;
    newPost.likeCount = 0;
    newPost.createdAt = new Date();
    newPost.updatedAt = new Date();

    const savedPost = await AppDataSource.getRepository(Post).save(newPost);

    const newPostCategory = new PostCategory();
    newPostCategory.postId = savedPost.id;
    newPostCategory.categoryId = categoryEntity.id;

    await AppDataSource.getRepository(PostCategory).save(newPostCategory);

    res.status(201).json({
      message: "게시글이 저장되었습니다.",
      data: savedPost,
    });
  } catch (error) {
    console.error("게시글 저장 오류:", error);
    res.status(500).json({
      success: false,
      message: "게시글 저장 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
});

export default router;
