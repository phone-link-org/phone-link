import { Router } from "express";
import { AppDataSource } from "../db";
import type { PostListDto } from "../../../shared/post.types";

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

export default router;
