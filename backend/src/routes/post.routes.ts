import { Router } from "express";
import { AppDataSource } from "../db";
import type {
  PostListDto,
  PostDetailDto,
  CategoryDto,
  PostImageDto,
  PostFileDto,
  CommentListDto,
} from "../../../shared/post.types";
import { Post } from "../typeorm/posts.entity";
import { Category } from "../typeorm/categories.entity";
import { PostCategory } from "../typeorm/postCategories.entity";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

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

  // 트랜잭션 시작
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 카테고리 존재 여부 확인
    const categoryEntity = await queryRunner.manager.findOne(Category, {
      where: { name: category },
    });

    if (!categoryEntity) {
      await queryRunner.rollbackTransaction();
      return res.status(404).json({
        success: false,
        message: "존재하지 않은 카테고리입니다.",
      });
    }

    // 게시글 생성
    const newPost = new Post();
    newPost.title = title;
    newPost.content = content;
    newPost.userId = userId;
    newPost.viewCount = 0;
    newPost.likeCount = 0;
    newPost.createdAt = new Date();
    newPost.updatedAt = new Date();

    const savedPost = await queryRunner.manager.save(Post, newPost);

    // 게시글-카테고리 연결 생성
    const newPostCategory = new PostCategory();
    newPostCategory.postId = savedPost.id;
    newPostCategory.categoryId = categoryEntity.id;

    await queryRunner.manager.save(PostCategory, newPostCategory);

    // 트랜잭션 커밋
    await queryRunner.commitTransaction();

    res.status(201).json({
      success: true,
      data: savedPost,
    });
  } catch (error) {
    // 트랜잭션 롤백
    await queryRunner.rollbackTransaction();

    console.error("게시글 저장 오류:", error);
    res.status(500).json({
      success: false,
      message: "게시글 저장 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  } finally {
    // QueryRunner 해제
    await queryRunner.release();
  }
});

// 게시글 상세 조회
router.get("/detail/:id", async (req: AuthenticatedRequest, res) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const { id } = req.params;
    const postId = parseInt(id);
    //const userId = req.user?.id;

    if (isNaN(postId) || postId <= 0) {
      return res.status(400).json({
        success: false,
        message: "유효하지 않은 게시글 ID입니다.",
      });
    }

    // 게시글 상세 정보 조회 쿼리
    const query = `
      SELECT 
        p.id AS id,
        p.user_id AS userId,
        p.title AS title,
        p.thumbnail_url AS thumbnailUrl,
        p.content AS content,
        p.view_count AS viewCount,
        p.like_count AS likeCount,
        p.is_deleted AS isDeleted,
        p.created_at AS createdAt,
        p.updated_at AS updatedAt,
        u.id AS authorId,
        u.nickname AS authorNickname,
        u.profile_image_url AS authorProfileImageUrl
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ? AND p.is_deleted = false
    `;

    const postResult = await queryRunner.query(query, [postId]);

    if (!postResult || postResult.length === 0) {
      await queryRunner.rollbackTransaction();
      return res.status(404).json({
        success: false,
        message: "게시글을 찾을 수 없습니다.",
      });
    }

    const postData = postResult[0];

    // 조회수 증가 (트랜잭션 내에서 처리)
    await queryRunner.query(`UPDATE posts SET view_count = view_count + 1 WHERE id = ?`, [postId]);

    // 카테고리 정보 조회
    const categoriesQuery = `
      SELECT c.id, c.name
      FROM categories c
      JOIN post_categories pc ON c.id = pc.category_id
      WHERE pc.post_id = ?
    `;
    const categories = await queryRunner.query(categoriesQuery, [postId]);

    // 댓글 정보 조회 (작성자 정보 포함)
    const commentsQuery = `
      SELECT 
        c.id AS id,
        c.post_id AS postId,
        c.user_id AS userId,
        c.parent_id AS parentId,
        c.content AS content,
        c.like_count AS likeCount,
        c.is_deleted AS isDeleted,
        c.created_at AS createdAt,
        c.updated_at AS updatedAt,
        u.nickname AS authorNickname,
        u.profile_image_url AS authorProfileImageUrl
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ? AND c.is_deleted = false
      ORDER BY c.created_at ASC
    `;
    const comments = await queryRunner.query(commentsQuery, [postId]);

    // 이미지 정보 조회
    const imagesQuery = `
      SELECT id, post_id AS postId, image_url AS imageUrl, uploaded_at AS uploadedAt
      FROM post_images
      WHERE post_id = ?
    `;
    const images = await queryRunner.query(imagesQuery, [postId]);

    // 파일 정보 조회
    const filesQuery = `
      SELECT id, post_id AS postId, file_name AS fileName, file_url AS fileUrl, file_size AS fileSize, uploaded_at AS uploadedAt
      FROM post_files
      WHERE post_id = ?
    `;
    const files = await queryRunner.query(filesQuery, [postId]);

    // 트랜잭션 커밋
    await queryRunner.commitTransaction();

    // PostDetailDto 형식으로 데이터 구성
    const postDetail: PostDetailDto = {
      id: postData.id,
      userId: postData.userId,
      title: postData.title,
      thumbnailUrl: postData.thumbnailUrl || "",
      content: postData.content,
      viewCount: postData.viewCount + 1, // 증가된 조회수 반영
      likeCount: postData.likeCount,
      isDeleted: Boolean(postData.isDeleted),
      createdAt: new Date(postData.createdAt),
      updatedAt: postData.updatedAt ? new Date(postData.updatedAt) : undefined,
      authorId: postData.authorId,
      authorNickname: postData.authorNickname,
      authorProfileImageUrl: postData.authorProfileImageUrl || "",
      categories: (categories as { id: number; name: string }[]).map(
        (cat): Pick<CategoryDto, "id" | "name"> => ({
          id: cat.id,
          name: cat.name,
        }),
      ),
      comments: (
        comments as {
          id: number;
          content: string;
          likeCount: number;
          createdAt: string;
          parentId: number | null;
          userId: number;
          authorNickname: string;
          authorProfileImageUrl: string | null;
        }[]
      ).map(
        (comment): CommentListDto => ({
          id: comment.id,
          content: comment.content,
          likeCount: comment.likeCount,
          createdAt: new Date(comment.createdAt),
          parentId: comment.parentId || undefined,
          author: {
            id: comment.userId,
            nickname: comment.authorNickname,
            profileImageUrl: comment.authorProfileImageUrl || "",
          },
          isLiked: false, // TODO: 현재 사용자의 좋아요 여부 확인
        }),
      ),
      images: (images as { id: number; postId: number; imageUrl: string; uploadedAt: string }[]).map(
        (img): PostImageDto => ({
          id: img.id,
          postId: img.postId,
          imageUrl: img.imageUrl,
          uploadedAt: new Date(img.uploadedAt),
        }),
      ),
      files: (
        files as {
          id: number;
          postId: number;
          fileName: string;
          fileUrl: string;
          fileSize: number;
          uploadedAt: string;
        }[]
      ).map(
        (file): PostFileDto => ({
          id: file.id,
          postId: file.postId,
          fileName: file.fileName,
          fileUrl: file.fileUrl,
          fileSize: file.fileSize,
          uploadedAt: new Date(file.uploadedAt),
        }),
      ),
      isLiked: false, // TODO: 현재 사용자의 좋아요 여부 확인
    };

    res.json({
      success: true,
      data: postDetail,
    });
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error("게시글 상세 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "게시글을 불러오는 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  } finally {
    await queryRunner.release();
  }
});

export default router;
