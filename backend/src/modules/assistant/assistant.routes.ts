import { Router } from "express";
import { AssistantController } from "./assistant.controller";
import { requireAuth } from "../../middleware/requireAuth";
import { validate } from "../../middleware/validate";
import { sendMessageSchema } from "./assistant.schema";

const router = Router();

// Protect all assistant endpoints
router.use(requireAuth);

router.post("/message", validate(sendMessageSchema), AssistantController.sendMessage);
router.get("/history", AssistantController.getHistory);

export default router;
