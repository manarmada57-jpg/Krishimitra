import { Router } from "express";
import { FarmController } from "./farm.controller";
import { requireAuth } from "../../middleware/requireAuth";
import { validate } from "../../middleware/validate";
import { ownershipCheck } from "../../utils/ownershipCheck";
import { FarmModel } from "./farm.model";
import { createFarmSchema, updateFarmSchema } from "./farm.schema";

const router = Router();

// Protect all farm routes
router.use(requireAuth);

router.post("/", validate(createFarmSchema), FarmController.createFarm);
router.get("/", FarmController.getMyFarms);
router.get("/satellite-telemetry", FarmController.getSatelliteTelemetry);

// Ownership check is applied to individual document manipulation (GET/PATCH/DELETE)
router.get("/:id", ownershipCheck(FarmModel, "id", "user"), FarmController.getFarmDetails);
router.patch("/:id", validate(updateFarmSchema), ownershipCheck(FarmModel, "id", "user"), FarmController.updateFarm);
router.delete("/:id", ownershipCheck(FarmModel, "id", "user"), FarmController.deleteFarm);

export default router;
