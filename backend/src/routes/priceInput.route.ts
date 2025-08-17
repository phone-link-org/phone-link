import { Router } from "express";
import { AppDataSource } from "../db";
import { PriceSubmissionData } from "shared/types";
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
          if (
            !addons[i].name ||
            !addons[i].monthlyFee ||
            !addons[i].requiredDuration ||
            !addons[i].penaltyFee
          )
            continue;

          const newAddon = new Addon();
          newAddon.store_id = priceInputs[i].storeId;
          newAddon.carrier_id = parseInt(addons[i].carrier);
          newAddon.addon_name = addons[i].name;
          newAddon.monthly_fee = addons[i].monthlyFee;
          newAddon.req_duration = addons[i].requiredDuration;
          newAddon.penalty_fee = addons[i].penaltyFee;

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
          console.warn(
            `Device not found for model: ${priceInput.model} with capacity: ${priceInput.capacity}`,
          );
          continue;
        }

        const newOffer = new Offer();
        newOffer.store_id = priceInput.storeId;
        newOffer.carrier_id = parseInt(priceInput.carrier);
        newOffer.device_id = phoneDevice.id;
        newOffer.offer_type = priceInput.buyingType;
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

router.get('/list-models', async(_, res) => {
  try {
    const phoneModels = await AppDataSource.getRepository(PhoneModel).find({
      select: ["name_ko", "manufacturer_id"],
    });
    res.status(200).json(phoneModels);
  } catch (e) {
    console.error("Error during fetch phone models", e);
    res.status(500).json({ message: "Failed to fetch phone models" });
  }
})

router.get('/list-storages', async(_, res) => {
  try {
    const storages = await AppDataSource.getRepository(PhoneStorage).find({
      select: ["storage"],
    });
    res.status(200).json(storages);
  } catch (e) {
    console.error("Error during fetch storages");
    res.status(500).json({ message: "Failed to fetch storages" });
  }
})

export default router;
