import { Router } from "express";
import { CropController } from "./crop.controller";
import { requireAuth } from "../../middleware/requireAuth";
import { validate } from "../../middleware/validate";
import { ownershipCheck } from "../../utils/ownershipCheck";
import { CropModel } from "./crop.model";
import { createCropSchema, updateCropSchema } from "./crop.schema";

const router = Router();

// Protect all crop routes
router.use(requireAuth);

router.post("/", validate(createCropSchema), CropController.createCrop);
router.get("/", CropController.getMyCrops);
router.get("/farm/:farmId", CropController.getFarmCrops);

// Enforce ownership check on single record modifications
router.get("/:id", ownershipCheck(CropModel, "id", "user"), CropController.getCropDetails);
router.patch("/:id", validate(updateCropSchema), ownershipCheck(CropModel, "id", "user"), CropController.updateCrop);
router.delete("/:id", ownershipCheck(CropModel, "id", "user"), CropController.deleteCrop);

export default router;
