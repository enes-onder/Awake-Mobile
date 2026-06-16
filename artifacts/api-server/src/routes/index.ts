import { Router, type IRouter } from "express";
import healthRouter from "./health";
import contentRouter from "./content";
import profilesRouter from "./profiles";

const router: IRouter = Router();

router.use(healthRouter);
router.use(contentRouter);
router.use(profilesRouter);

export default router;
