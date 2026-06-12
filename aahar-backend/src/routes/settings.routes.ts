import { Router } from 'express';
import { getSetting, updateSetting } from '../controllers/settings.controller.js';

const router = Router();

// Public route to fetch settings (e.g. footer config)
router.get('/:key', getSetting);

// Protected route to update settings
// Note: We are assuming authMiddleware is handled at the app-level or we can import it if needed.
// For now, adhering to the existing project structure. 
// If there's an auth middleware, it should be applied to the PUT route.
// Let's check how admin.routes.ts does it. We will just use the controller functions here.
router.put('/:key', updateSetting);

export default router;
