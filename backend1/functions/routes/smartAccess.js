import express from 'express';
import {
  assignStaffSmartAccess,
  getSmartAccessGrants,
  revokeSmartAccessGrant
} from '../controllers/smartAccessController.js';

const router = express.Router({ mergeParams: true });

router.get('/hotels/:hotelId/smart-access/grants', getSmartAccessGrants);
router.post('/hotels/:hotelId/smart-access/staff', assignStaffSmartAccess);
router.post('/hotels/:hotelId/smart-access/:grantId/revoke', revokeSmartAccessGrant);

export default router;
