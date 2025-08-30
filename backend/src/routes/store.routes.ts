import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { AppDataSource } from "../db";
import { Store } from "../typeorm/stores.entity";
import { PendingStoreDto } from "../../../shared/store.types";

const router = Router();

// 업로드 디렉토리 생성
const uploadDir = path.join(__dirname, "../../uploads/images/store");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 파일명 중복 방지를 위해 타임스탬프 추가
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 제한
  },
  fileFilter: (req, file, cb) => {
    // 이미지 파일만 허용
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("이미지 파일만 업로드 가능합니다."));
    }
  },
});

router.get("/stores", async (req, res) => {
  try {
    const storeRepo = AppDataSource.getRepository(Store);
    const stores = await storeRepo.find({
      where: {
        approval_status: "APPROVED",
      },
    });
    res.status(200).json(stores);
  } catch (e) {
    console.error("Error during fetching stores", e);
    res.status(500).json({ message: "Error fetching stores" });
  }
});

// 매장명 중복 확인 엔드포인트
router.get("/check-name", async (req, res) => {
  try {
    const { inputStoreName } = req.query;

    if (!inputStoreName || typeof inputStoreName !== "string") {
      return res.status(400).json({
        message: "매장명을 입력해주세요.",
        isDuplicate: false,
      });
    }

    const storeRepo = AppDataSource.getRepository(Store);
    const transformedName = inputStoreName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "");

    // 대소문자 구분 없이 비교하기 위해 모든 매장을 가져와서 비교
    const allStores = await storeRepo.find();
    const existingStore = allStores.find(
      (store) =>
        store.name.trim().toLowerCase().replace(/\s+/g, "") === transformedName,
    );

    if (existingStore) {
      return res.status(200).json({
        message: "이미 존재하는 매장명입니다.",
        isDuplicate: true,
      });
    } else {
      return res.status(200).json({
        message: "사용 가능한 매장명입니다.",
        isDuplicate: false,
      });
    }
  } catch (e) {
    console.error("Error during checking store name", e);
    res.status(500).json({
      message: "매장명 확인 중 오류가 발생했습니다.",
      isDuplicate: false,
    });
  }
});

// 매장 이미지 업로드 엔드포인트
router.post("/upload-image", upload.single("thumbnail"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "이미지 파일을 선택해주세요.",
      });
    }

    // 상대 경로 반환 (프론트엔드에서 접근 가능한 경로)
    const relativePath = `/uploads/images/store/${req.file.filename}`;

    res.status(200).json({
      message: "이미지 업로드 성공",
      thumbnail_url: relativePath,
      filename: req.file.filename,
    });
  } catch (error) {
    console.error("Error during image upload", error);
    res.status(500).json({
      message: "이미지 업로드 중 오류가 발생했습니다.",
    });
  }
});

// 매장 이미지 삭제 엔드포인트
router.post("/delete-image", async (req, res) => {
  try {
    const { filename } = req.body;

    if (!filename || typeof filename !== "string") {
      return res.status(400).json({
        message: "파일명을 제공해주세요.",
      });
    }

    const filePath = path.join(uploadDir, filename);

    // 파일이 존재하는지 확인
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "파일을 찾을 수 없습니다.",
      });
    }

    // 파일 삭제
    fs.unlinkSync(filePath);

    res.status(200).json({
      message: "이미지가 성공적으로 삭제되었습니다.",
    });
  } catch (error) {
    console.error("Error during image deletion", error);
    res.status(500).json({
      message: "이미지 삭제 중 오류가 발생했습니다.",
    });
  }
});

// 매장 등록 요청 엔드포인트
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      region_code,
      address,
      address_detail,
      contact,
      thumbnail_url,
      link_1,
      link_2,
      owner_name,
      description,
      approval_status,
      created_by,
    } = req.body;

    // 필수 필드 검증
    if (!name || !address || !contact) {
      return res.status(400).json({
        message: "필수 정보가 누락되었습니다.",
      });
    }

    // region_code 필수 검증
    if (!region_code) {
      return res.status(500).json({
        message: "매장 등록 요청 중 오류가 발생했습니다.",
      });
    }

    // 매장명 중복 확인
    const storeRepo = AppDataSource.getRepository(Store);
    const transformedName = name.trim().toLowerCase().replace(/\s+/g, "");
    const allStores = await storeRepo.find();
    const existingStore = allStores.find(
      (store) =>
        store.name.trim().toLowerCase().replace(/\s+/g, "") === transformedName,
    );

    if (existingStore) {
      return res.status(400).json({
        message: "이미 존재하는 매장명입니다.",
      });
    }

    // 새 매장 생성
    const newStore = storeRepo.create({
      name: name,
      region_code: region_code,
      address: address,
      address_detail: address_detail || null,
      contact: contact.trim(),
      thumbnail_url: thumbnail_url || null,
      link_1: link_1?.trim() || null,
      link_2: link_2?.trim() || null,
      owner_name: owner_name?.trim() || null,
      description: description || null,
      approval_status: approval_status || "PENDING",
      created_by: created_by,
      created_at: new Date(),
      updated_at: new Date(),
    });

    await storeRepo.save(newStore);

    res.status(201).json({
      message: "매장 등록 요청이 성공적으로 제출되었습니다.",
      store: {
        id: newStore.id,
        name: newStore.name,
        approval_status: newStore.approval_status,
      },
    });
  } catch (error) {
    console.error("Error during store registration", error);
    res.status(500).json({
      message: "매장 등록 요청 중 오류가 발생했습니다.",
    });
  }
});

// 승인 대기 상태인 매장 데이터 조회 엔드포인트
router.get("/pending-stores", async (req, res) => {
  try {
    const storeRepo = AppDataSource.getRepository(Store);

    // 승인 대기 상태인 매장 데이터 조회
    const pendingStores = await storeRepo
      .createQueryBuilder("s")
      .leftJoin("regions", "r", "s.region_code = r.code")
      .leftJoin("users", "u", "s.created_by = u.id")
      .select([
        "s.id as id",
        "s.name as name",
        "s.contact as contact",
        "s.created_at as created_at",
        "s.created_by as created_by",
        "s.region_code as region_code",
        "r.name as region_name",
        "u.email as user_email",
      ])
      .where("s.approval_status = :status", { status: "PENDING" })
      .getRawMany<PendingStoreDto>();

    res.status(200).json({
      message: "승인 대기 매장 목록을 성공적으로 조회했습니다.",
      stores: pendingStores,
    });
  } catch (error) {
    console.error("Error during fetching pending stores", error);
    res.status(500).json({
      message: "승인 대기 매장 목록 조회 중 오류가 발생했습니다.",
    });
  }
});

export default router;
