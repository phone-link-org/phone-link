import { NextFunction, Router, Request, Response } from "express";
import multer, { MulterError } from "multer";
import path from "path";
import fs from "fs";
import { AppDataSource } from "../db";
import { Store } from "../typeorm/stores.entity";
import { PendingStoreDto } from "../../../shared/store.types";
import { Addon } from "../typeorm/addons.entity";
import { AddonFormData } from "shared/addon.types";
import { Offer } from "../typeorm/offers.entity";
import { StoreOfferModel, StoreOfferPriceFormData } from "shared/offer.types";

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

const handleUploadErrors = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        // 이제 이 부분에서 에러가 발생하지 않습니다.
        success: false,
        message: "이미지 파일 크기는 5MB를 초과할 수 없습니다.",
        error: "File Too Large",
      });
    }
    return res.status(400).json({
      success: false,
      message: `파일 업로드 중 오류 발생: ${err.message}`,
      error: "Bad Request",
    });
  } else if (err) {
    // fileFilter에서 발생한 에러 처리
    return res.status(400).json({
      success: false,
      message: err.message,
      error: "Bad Request",
    });
  }
  next();
};

router.get("/stores", async (req, res) => {
  try {
    const storeRepo = AppDataSource.getRepository(Store);
    const stores = await storeRepo.find({
      where: {
        approval_status: "APPROVED",
      },
    });
    res.status(200).json({
      success: true,
      data: stores,
    });
  } catch (e) {
    console.error("Error during fetching stores", e);
    res.status(500).json({
      success: false,
      message: "매장 목록을 불러오는 중 오류가 발생했습니다.",
      error: "Internal Server Error",
    });
  }
});

// 매장명 중복 확인 엔드포인트
router.get("/check-name", async (req, res) => {
  try {
    const { inputStoreName } = req.query;

    if (!inputStoreName || typeof inputStoreName !== "string") {
      return res.status(400).json({
        success: false,
        message: "매장명을 입력해주세요.",
        error: "Bad Request",
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
        success: true,
        data: {
          isDuplicate: true,
          message: "이미 존재하는 매장명입니다.",
        },
      });
    } else {
      return res.status(200).json({
        success: true,
        data: {
          isDuplicate: false,
          message: "사용 가능한 매장명입니다.",
        },
      });
    }
  } catch (e) {
    console.error("Error during checking store name", e);
    res.status(500).json({
      success: false,
      message: "매장명 확인 중 오류가 발생했습니다.",
      error: "Internal Server Error",
    });
  }
});

// 매장 이미지 업로드 엔드포인트
router.post(
  "/upload-image",
  upload.single("thumbnail"),
  handleUploadErrors,
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "이미지 파일을 선택해주세요.",
          error: "Bad Request",
        });
      }

      // 상대 경로 반환 (프론트엔드에서 접근 가능한 경로)
      const relativePath = `/uploads/images/store/${req.file.filename}`;

      res.status(200).json({
        success: true,
        data: {
          thumbnail_url: relativePath,
        },
      });
    } catch (error) {
      console.error("Error during image upload", error);
      res.status(500).json({
        success: false,
        message: "이미지 업로드 중 오류가 발생했습니다.",
        error: "Internal Server Error",
      });
    }
  },
);

// 매장 이미지 삭제 엔드포인트
router.post("/delete-image", async (req, res) => {
  try {
    const { filename } = req.body;

    if (!filename || typeof filename !== "string") {
      return res.status(400).json({
        success: false,
        message: "삭제할 파일명을 확인할 수 없습니다. 다시 시도하세요.",
        error: "Bad Request",
      });
    }

    const filePath = path.join(uploadDir, filename);

    // 파일이 존재하는지 확인
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "삭제할 파일을 찾을 수 없습니다.",
        error: "Not Found",
      });
    }

    // 파일 삭제
    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: "이미지가 성공적으로 삭제되었습니다.",
    });
  } catch (error) {
    console.error("Error during image deletion", error);
    res.status(500).json({
      success: false,
      message: "이미지 삭제 중 오류가 발생했습니다.",
      error: "Internal Server Error",
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
    if (!name || !address || !contact || !region_code) {
      return res.status(400).json({
        success: false,
        message: "필수 정보(매장명, 주소, 연락처)가 누락되었습니다.",
        error: "Bad Request",
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
      return res.status(409).json({
        success: false,
        message: "이미 존재하는 매장명입니다.",
        error: "Conflict",
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
      success: true,
      message: "매장 등록 요청이 성공적으로 제출되었습니다.",
      data: {
        id: newStore.id,
        name: newStore.name,
        approval_status: newStore.approval_status,
      },
    });
  } catch (error) {
    console.error("Error during store registration", error);
    res.status(500).json({
      success: false,
      message: "매장 등록 요청 중 오류가 발생했습니다.",
      error: "Internal Server Error",
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
      success: true,
      data: pendingStores,
    });
  } catch (error) {
    console.error("Error during fetching pending stores", error);
    res.status(500).json({
      success: false,
      message: "승인 대기 매장 목록 조회 중 오류가 발생했습니다.",
      error: "Internal Server Error",
    });
  }
});

router.get("/:storeId/offers", async (req, res) => {
  try {
    const { storeId } = req.params;
    const offerRepo = AppDataSource.getRepository(Offer);

    const offers = await offerRepo
      .createQueryBuilder("o")
      .select([
        "o.id as id",
        "c.id as carrier_id",
        "c.name as carrier_name",
        "o.offer_type as offer_type",
        "pm.id as model_id",
        "pm.name_ko as model_name",
        "ps.id as storage_id",
        "ps.storage as storage",
        "o.price as price",
        "pm2.id as manufacturer_id",
      ])
      .innerJoin("o.carrier", "c")
      .innerJoin("o.device", "pd")
      .innerJoin("pd.model", "pm")
      .innerJoin("pd.storage", "ps")
      .innerJoin("pm.manufacturer", "pm2")
      .where("o.store_id = :storeId", { storeId: parseInt(storeId) })
      .orderBy("pm2.id", "ASC")
      .addOrderBy("pm.release_date", "ASC")
      .addOrderBy("LENGTH(pm.name_ko)", "ASC")
      .addOrderBy("pm.name_ko", "ASC")
      .addOrderBy("ps.storage", "ASC")
      .addOrderBy("c.id", "ASC")
      .addOrderBy("o.offer_type", "ASC")
      .getRawMany<StoreOfferPriceFormData>();

    // 🔹 계층 구조로 가공
    const response: StoreOfferModel[] = [];

    for (const row of offers) {
      // 모델 찾기
      let model = response.find((m) => m.model_id === row.model_id);
      if (!model) {
        model = {
          manufacturer_id: row.manufacturer_id,
          model_id: row.model_id,
          model_name: row.model_name,
          storages: [],
        };
        response.push(model);
      }

      // 스토리지 찾기
      let storage = model.storages.find((s) => s.storage_id === row.storage_id);
      if (!storage) {
        storage = {
          storage_id: row.storage_id,
          storage: row.storage,
          carriers: [],
        };
        model.storages.push(storage);
      }

      // 통신사 찾기
      let carrier = storage.carriers.find(
        (c) => c.carrier_id === row.carrier_id,
      );
      if (!carrier) {
        carrier = {
          carrier_id: row.carrier_id,
          carrier_name: row.carrier_name,
          offer_types: [],
        };
        storage.carriers.push(carrier);
      }

      // 조건 추가
      carrier.offer_types.push({
        offer_type: row.offer_type,
        price: row.price,
      });
    }

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error during fetching addons", error);
    res.status(500).json({
      success: false,
      message: "부가서비스 조회 중 오류가 발생했습니다.",
      error: "Internal Server Error",
    });
  }
});

router.get("/:storeId/addons", async (req, res) => {
  try {
    const { storeId } = req.params;
    const addonRepo = AppDataSource.getRepository(Addon);
    const result = await addonRepo.find({
      where: { store_id: parseInt(storeId) },
    });

    const parsedResult: AddonFormData[] = result.map((addon) => ({
      ...addon,
      carrierId: addon.carrier_id,
      monthlyFee: addon.monthly_fee,
      durationMonths: addon.duration_months,
      penaltyFee: addon.penalty_fee,
    }));

    res.status(200).json({
      success: true,
      data: parsedResult,
    });
  } catch (error) {
    console.error("Error during fetching addons", error);
    res.status(500).json({
      success: false,
      message: "부가서비스 조회 중 오류가 발생했습니다.",
      error: "Internal Server Error",
    });
  }
});

router.post("/:storeId/addon-save", async (req, res) => {
  try {
    const { storeId } = req.params;
    const { addons } = req.body;

    // 트랜잭션을 사용하여 데이터 무결성을 보장
    const result = await AppDataSource.transaction(
      async (transactionalEntityManager) => {
        const storeIdNumber = parseInt(storeId);

        // 기존 데이터 삭제
        await transactionalEntityManager.delete(Addon, {
          store_id: storeIdNumber,
        });

        if (addons.length === 0) {
          return []; // 저장할 것이 없으므로 빈 배열 반환
        }

        // 새로운 데이터를 저장할 객체 배열 생성
        const newAddons = addons.map((addon: AddonFormData) => ({
          store_id: storeIdNumber,
          carrier_id: addon.carrierId,
          name: addon.name,
          monthly_fee: addon.monthlyFee,
          duration_months: addon.durationMonths,
          penalty_fee: addon.penaltyFee,
        }));

        // 새로운 데이터 저장
        const savedAddons = await transactionalEntityManager.save(
          Addon,
          newAddons,
        );

        return savedAddons;
      },
    );

    res.status(200).json({
      success: true,
      message: "부가서비스가 성공적으로 저장되었습니다.",
      data: result,
    });
  } catch (error) {
    console.error("Error during saving addons", error);
    res.status(500).json({
      success: false,
      message: "부가서비스 저장 중 오류가 발생했습니다.",
      error: "Internal Server Error",
    });
  }
});

export default router;
