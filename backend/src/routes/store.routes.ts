import { Router } from "express";
import { AppDataSource } from "../db";
import { Store } from "../typeorm/stores.entity";

const router = Router();

router.get("/stores", async (req, res) => {
  try {
    const storeRepo = AppDataSource.getRepository(Store);
    const stores = await storeRepo.find();
    res.status(200).json(stores);
  } catch (e) {
    console.error("Error during fetching stores", e);
    res.status(500).json({ message: "Error fetching stores" });
  }
});

export default router;
