import { Router } from 'express';
import { authenticate }    from '../middleware/authenticate.js';
import { ownershipGuard }  from '../middleware/ownershipGuard.js';
import { validate, createVaultSchema, updateVaultSchema } from '../middleware/validateRequest.js';
import {
  listEntries,
  getEntry,
  createEntry,
  updateEntry,
  deleteEntry,
  toggleFavorite,
} from '../controllers/vaultController.js';

const router = Router();

// All vault routes require a valid JWT
router.use(authenticate);

router.get('/',    listEntries);
router.post('/',   validate(createVaultSchema), createEntry);

// Routes with :id also run the ownership guard before the controller
router.get   ('/:id',          ownershipGuard, getEntry);
router.put   ('/:id',          ownershipGuard, validate(updateVaultSchema), updateEntry);
router.delete('/:id',          ownershipGuard, deleteEntry);
router.patch ('/:id/favorite', ownershipGuard, toggleFavorite);

export default router;
