import { Router } from "express";
import { AppDataSource } from "../db";
import { Category } from "../typeorm/categories.entity";

const router = Router();

// 커뮤니티 카테고리 목록 조회
router.get("/community-categories", async (req, res) => {
  try {
    const categoriesRepository = AppDataSource.getRepository(Category);

    const categories = await categoriesRepository
      .createQueryBuilder("c")
      .where("c.description LIKE :pattern", { pattern: "%게시판" })
      .select(["c.id", "c.name", "c.description"])
      .getMany();

    const responseData = categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
    }));

    res.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("커뮤니티 카테고리 조회 오류:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
      message: "커뮤니티 카테고리 조회 중 오류가 발생했습니다.",
    });
  }
});

export default router;
