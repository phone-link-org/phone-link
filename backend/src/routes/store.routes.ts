import { NextFunction, Router, Request, Response } from "express";
import multer, { MulterError } from "multer";
import path from "path";
import fs from "fs";
import { AppDataSource } from "../db";
import { Store } from "../typeorm/stores.entity";
import {
  PendingStoreDto,
  StoreRegisterFormData,
} from "../../../shared/store.types";
import { Addon } from "../typeorm/addons.entity";
import { AddonFormData } from "shared/addon.types";
import { Offer } from "../typeorm/offers.entity";
import { StoreOfferModel, StoreOfferPriceFormData } from "shared/offer.types";
import { PhoneDevice } from "../typeorm/phoneDevices.entity";
import { OfferDto } from "shared/offer.types";
import { PhoneDeviceDto } from "shared/phone.types";
import { hasRole, isAuthenticated } from "../middlewares/auth.middleware";

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
        approvalStatus: "APPROVED",
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
router.get(
  "/check-name",
  isAuthenticated, // 로그인 여부 확인 미들웨어
  hasRole(["SELLER"]), // 권한 확인 미들웨어
  async (req, res) => {
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
          store.name.trim().toLowerCase().replace(/\s+/g, "") ===
          transformedName,
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
  },
);

// 매장 이미지 업로드 엔드포인트
router.post(
  "/upload-image",
  isAuthenticated, // 로그인 여부 확인 미들웨어
  hasRole(["SELLER"]), // 권한 확인 미들웨어
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
          thumbnailUrl: relativePath,
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
router.post(
  "/delete-image",
  isAuthenticated,
  hasRole(["SELLER"]),
  async (req, res) => {
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
  },
);

// 매장 등록 요청 엔드포인트
router.post(
  "/register",
  isAuthenticated,
  hasRole(["SELLER"]),
  async (req, res) => {
    try {
      const {
        name,
        regionCode,
        address,
        addressDetail,
        contact,
        thumbnailUrl,
        link_1,
        link_2,
        ownerName,
        description,
        approvalStatus,
        createdBy,
      } = req.body;

      // 필수 필드 검증
      if (!name || !address || !contact || !regionCode) {
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
          store.name.trim().toLowerCase().replace(/\s+/g, "") ===
          transformedName,
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
        regionCode: regionCode,
        address: address,
        addressDetail: addressDetail || null,
        contact: contact.trim(),
        thumbnailUrl: thumbnailUrl || null,
        link_1: link_1?.trim() || null,
        link_2: link_2?.trim() || null,
        ownerName: ownerName?.trim() || null,
        description: description || null,
        approvalStatus: approvalStatus || "PENDING",
        createdBy: createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await storeRepo.save(newStore);

      res.status(201).json({
        success: true,
        message: "매장 등록 요청이 성공적으로 제출되었습니다.",
        data: {
          id: newStore.id,
          name: newStore.name,
          approvalStatus: newStore.approvalStatus,
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
  },
);

// 승인 대기 상태인 매장 데이터 조회 엔드포인트
router.get(
  "/pending",
  isAuthenticated,
  hasRole(["ADMIN"]),
  async (req, res) => {
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
          "s.created_at as createdAt",
          "s.created_by as createdBy",
          "s.region_code as regionCode",
          "r.name as regionName",
          "u.email as userEmail",
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
  },
);

router.get("/:storeId/offers", async (req, res) => {
  try {
    const { storeId } = req.params;
    const offerRepo = AppDataSource.getRepository(Offer);

    const response = await offerRepo
      .createQueryBuilder("o")
      .select([
        "o.id as id",
        "c.id as carrierId",
        "c.name as carrierName",
        "o.offer_type as offerType",
        "pm.id as modelId",
        "pm.name_ko as modelName",
        "ps.id as storageId",
        "ps.storage as storage",
        "o.price as price",
        "pm2.id as manufacturerId",
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
    const formattedData: StoreOfferModel[] = [];

    for (const row of response) {
      // 모델 찾기
      let model = formattedData.find((m) => m.modelId === row.modelId);
      if (!model) {
        model = {
          manufacturerId: row.manufacturerId,
          modelId: row.modelId,
          modelName: row.modelName,
          storages: [],
        };
        formattedData.push(model);
      }

      // 스토리지 찾기
      let storage = model.storages.find((s) => s.storageId === row.storageId);
      if (!storage) {
        storage = {
          storageId: row.storageId,
          storage: row.storage,
          carriers: [],
        };
        model.storages.push(storage);
      }

      // 통신사 찾기
      let carrier = storage.carriers.find((c) => c.carrierId === row.carrierId);
      if (!carrier) {
        carrier = {
          carrierId: row.carrierId,
          carrierName: row.carrierName,
          offerTypes: [],
        };
        storage.carriers.push(carrier);
      }

      // 조건 추가
      carrier.offerTypes.push({
        offerType: row.offerType,
        price: row.price,
      });
    }

    res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.error("Error during fetching offers", error);
    res.status(500).json({
      success: false,
      message: "가격 정보 조회 중 오류가 발생했습니다.",
      error: "Internal Server Error",
    });
  }
});

router.post(
  "/:storeId/offers",
  isAuthenticated,
  hasRole(["SELLER"]),
  async (req, res) => {
    const { storeId } = req.params;
    const { offers } = req.body;

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const offerRepo = queryRunner.manager.getRepository(Offer);
      const deviceRepo = queryRunner.manager.getRepository(PhoneDevice);

      // N+1 문제 해결을 위해 필요한 모든 device 정보를 미리 조회
      const deviceIdentifiers = offers.flatMap((model: StoreOfferModel) =>
        model.storages.map((storage) => ({
          modelId: model.modelId,
          storageId: storage.storageId,
        })),
      );
      const devices = await deviceRepo.find({ where: deviceIdentifiers });
      // 빠른 조회를 위해 Map으로 변환: '모델ID-스토리지ID'를 키로 사용
      const deviceMap = new Map(
        devices.map(
          (d) => [`${d.modelId}-${d.storageId}`, d] as [string, PhoneDeviceDto],
        ),
      );

      // 클라이언트에서 받은 데이터를 DB에 저장할 최종 형태로 가공
      const newOfferMap = new Map<string, OfferDto>();
      for (const model of offers) {
        for (const storage of model.storages) {
          for (const carrier of storage.carriers) {
            for (const offerType of carrier.offerTypes) {
              const device = deviceMap.get(
                `${model.modelId}-${storage.storageId}`,
              );
              if (device) {
                // 유니크한 키를 생성하여 Offer를 식별
                const offerKey = `${carrier.carrierId}-${device.id}-${offerType.offerType}`;
                const offerData: OfferDto = {
                  storeId: parseInt(storeId),
                  carrierId: carrier.carrierId,
                  deviceId: device.id,
                  offerType: offerType.offerType,
                  price: offerType.price,
                  updatedBy: 9999, //TODO: 로그인 정보 가져와서 ID값으로 변경 필요!
                };
                newOfferMap.set(offerKey, offerData);
              }
            }
          }
        }
      }

      // DB에 저장된 기존 Offer 데이터를 조회
      const existingOffers = await offerRepo.findBy({
        storeId: parseInt(storeId),
      });
      const existingOfferMap = new Map(
        existingOffers.map((o) => {
          const key = `${o.carrierId}-${o.deviceId}-${o.offerType}`;
          return [key, o];
        }),
      );

      // 추가(Insert), 수정(Update), 삭제(Delete)할 대상을 분류
      const toInsert: OfferDto[] = [];
      const toUpdate: Offer[] = [];
      const toDelete: number[] = []; // id 배열

      // 새로운 데이터를 기준으로 Insert/Update 대상 찾기
      for (const [key, newOffer] of newOfferMap.entries()) {
        const existingOffer = existingOfferMap.get(key);

        if (existingOffer) {
          // 기존에 데이터가 있으면
          // 가격이 다를 경우에만 업데이트 목록에 추가
          if (existingOffer.price !== newOffer.price) {
            toUpdate.push({ ...existingOffer, price: newOffer.price ?? null });
          }
          // 비교가 끝난 항목은 기존 맵에서 제거
          existingOfferMap.delete(key);
        } else {
          // 기존에 데이터가 없으면
          toInsert.push(newOffer); // 추가 목록에 추가
        }
      }

      // 이제 existingOfferMap에 남아있는 데이터는 삭제 대상입니다.
      for (const offerToDelete of existingOfferMap.values()) {
        toDelete.push(offerToDelete.id);
      }

      // 5. 분류된 데이터를 바탕으로 DB 작업을 실행합니다.
      if (toDelete.length > 0) {
        await offerRepo.delete(toDelete);
      }
      if (toUpdate.length > 0) {
        await offerRepo.save(toUpdate);
      }
      if (toInsert.length > 0) {
        await offerRepo.insert(toInsert);
      }

      // 6. 모든 작업이 성공했으므로 트랜잭션을 커밋합니다.
      await queryRunner.commitTransaction();

      res.status(200).json({
        success: true,
        data: {
          inserted: toInsert.length,
          updated: toUpdate.length,
          deleted: toDelete.length,
        },
      });
    } catch (error) {
      // 에러 발생 시 모든 변경사항을 롤백합니다.
      await queryRunner.rollbackTransaction();
      console.error("Error during saving offers", error);
      res.status(500).json({
        success: false,
        message: "가격 정보 저장 중 오류가 발생했습니다.",
        error: "Internal Server Error",
      });
    } finally {
      // 사용한 QueryRunner를 반드시 해제해줘야 합니다.
      await queryRunner.release();
    }
  },
);

router.get("/:storeId/addons", async (req, res) => {
  try {
    const { storeId } = req.params;
    const addonRepo = AppDataSource.getRepository(Addon);
    const result = await addonRepo.find({
      where: { storeId: parseInt(storeId) },
    });

    const parsedResult: AddonFormData[] = result.map((addon) => ({
      ...addon,
      carrierId: addon.carrierId,
      monthlyFee: addon.monthlyFee,
      durationMonths: addon.durationMonths,
      penaltyFee: addon.penaltyFee,
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

router.get("/:storeId/detail", async (req, res) => {
  try {
    const { storeId } = req.params;
    const storeRepo = AppDataSource.getRepository(Store);
    const store = await storeRepo.findOne({
      where: { id: parseInt(storeId) },
      select: [
        "name",
        "description",
        "regionCode",
        "address",
        "addressDetail",
        "contact",
        "thumbnailUrl",
        "link_1",
        "link_2",
        "ownerName",
        "approvalStatus",
        "createdBy",
      ],
    });

    if (!store) {
      res.status(404).json({
        success: false,
        message: "매장 상세정보 조회 중 오류가 발생했습니다.",
        error: "Not Found",
      });
    } else {
      const responseData: StoreRegisterFormData = store;

      res.status(200).json({
        success: true,
        data: responseData,
      });
    }
  } catch (error) {
    console.error("Error during fetching store detail", error);
    res.status(500).json({
      success: false,
      message: "매장 상세정보 조회 중 오류가 발생했습니다.",
      error: "Internal Server Error",
    });
  }
});

router.post(
  "/:storeId/addon-save",
  isAuthenticated,
  hasRole(["SELLER"]),
  async (req, res) => {
    try {
      const { storeId } = req.params;
      const { addons } = req.body;

      // 트랜잭션을 사용하여 데이터 무결성을 보장
      const result = await AppDataSource.transaction(
        async (transactionalEntityManager) => {
          const storeIdNumber = parseInt(storeId);

          // 기존 데이터 삭제
          await transactionalEntityManager.delete(Addon, {
            storeId: storeIdNumber,
          });

          if (addons.length === 0) {
            return []; // 저장할 것이 없으므로 빈 배열 반환
          }

          // 새로운 데이터를 저장할 객체 배열 생성
          const newAddons = addons.map((addon: AddonFormData) => ({
            storeId: storeIdNumber,
            carrierId: addon.carrierId,
            name: addon.name,
            monthlyFee: addon.monthlyFee,
            durationMonths: addon.durationMonths,
            penaltyFee: addon.penaltyFee,
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
  },
);

export default router;
