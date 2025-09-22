import { Router } from "express";
import { AppDataSource } from "../db";
import { PriceSubmissionData } from "../../../shared/types";
import { Addon } from "../typeorm/addons.entity";
import { Offer } from "../typeorm/offers.entity";
import { PhoneDevice } from "../typeorm/phoneDevices.entity";
import { PhoneModel } from "../typeorm/phoneModels.entity";
import { PhoneStorage } from "../typeorm/phoneStorage.entity";

const router = Router();

router.post("/", async (req, res) => {
  const { priceInputs, addons }: PriceSubmissionData = req.body;

  try {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const savedAddons: Addon[] = [];
      if (addons && addons.length > 0) {
        for (let i = 0; i < addons.length; i++) {
          if (!addons[i].name || !addons[i].monthlyFee || !addons[i].requiredDuration || !addons[i].penaltyFee)
            continue;

          const newAddon = new Addon();
          newAddon.storeId = priceInputs[i].storeId;
          newAddon.carrierId = parseInt(addons[i].carrier);
          newAddon.name = addons[i].name;
          newAddon.monthlyFee = addons[i].monthlyFee;
          newAddon.durationMonths = addons[i].requiredDuration;
          newAddon.penaltyFee = addons[i].penaltyFee;

          const savedAddon = await transactionalEntityManager.save(newAddon);
          savedAddons.push(savedAddon);
        }
      }

      for (const priceInput of priceInputs) {
        const phoneDevice = await transactionalEntityManager
          .getRepository(PhoneDevice)
          .createQueryBuilder("pd")
          .innerJoin(PhoneModel, "pm", "pd.model_id = pm.id")
          .innerJoin(PhoneStorage, "ps", "pd.storage_id = ps.id")
          .where("REPLACE(pm.name_ko, ' ', '') LIKE :model", {
            model: `%${priceInput.model.replace(/\s/g, "")}%`,
          })
          .orWhere("REPLACE(pm.name_en, ' ', '') LIKE :model", {
            model: `%${priceInput.model.replace(/\s/g, "")}%`,
          })
          .andWhere("ps.storage = :storage", { storage: priceInput.capacity })
          .getOne();

        if (!phoneDevice) {
          console.warn(`Device not found for model: ${priceInput.model} with capacity: ${priceInput.capacity}`);
          continue;
        }

        const newOffer = new Offer();
        newOffer.storeId = priceInput.storeId;
        newOffer.carrierId = parseInt(priceInput.carrier);
        newOffer.deviceId = phoneDevice.id;
        newOffer.offerType = priceInput.buyingType;
        newOffer.price = priceInput.typePrice;
        //newOffer.addons = savedAddons;

        await transactionalEntityManager.save(newOffer);
      }
    });

    res.status(201).json({ message: "Data successfully saved." });
  } catch (e) {
    console.error("Error during data insertion:", e);
    res.status(500).json({ message: "Failed to save data." });
  }
});

router.get("/list-models", async (_, res) => {
  try {
    const phoneModels = await AppDataSource.getRepository(PhoneModel).find({
      select: ["name_ko", "manufacturerId"],
    });
    res.status(200).json(phoneModels);
  } catch (e) {
    console.error("Error during fetch phone models", e);
    res.status(500).json({ message: "Failed to fetch phone models" });
  }
});

router.get("/list-storages", async (_, res) => {
  try {
    const storages = await AppDataSource.getRepository(PhoneStorage).find({
      select: ["storage"],
    });
    res.status(200).json(storages);
  } catch (e) {
    console.error("Error during fetch storages", e);
    res.status(500).json({ message: "Failed to fetch storages" });
  }
});

router.get("/devices", async (_, res) => {
  try {
    const devices = await AppDataSource.getRepository(PhoneDevice)
      .createQueryBuilder("device")
      .select(['model.name_ko AS "modelName"', "storage.storage AS storage", 'manufacturer.id AS "manufacturerId"'])
      .innerJoin("device.model", "model")
      .innerJoin("model.manufacturer", "manufacturer")
      .innerJoin("device.storage", "storage")
      .orderBy("model.name_ko")
      .addOrderBy("storage.id")
      .getRawMany();

    res.status(200).json(devices);
  } catch (error) {
    console.error("Error fetching devices", error);
    res.status(500).json({ message: "Failed to fetch devices." });
  }
});

export default router;
