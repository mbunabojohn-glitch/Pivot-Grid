import express from 'express';
import hook from '../webhooks/brokerWebhook.js';
import User from '../models/User.js';

const { handle } = hook;
const router = express.Router();

router.post('/broker', express.raw({ type: '*/*' }), handle);
router.post('/kyc/:provider', express.json(), async (req, res) => {
  try {
    const provider = String(req.params.provider || '').toLowerCase();
    if (!['smile', 'verifyme', 'dojah'].includes(provider)) {
      return res.status(400).json({ error: 'unsupported_provider' });
    }
    const ref = (req.body && (req.body.referenceId || req.body.ref || req.body.sessionId)) || '';
    const statusRaw = (req.body && (req.body.status || req.body.result || req.body.verification_status)) || '';
    if (!ref || !statusRaw) return res.status(400).json({ error: 'missing_fields' });
    const map = { PENDING: 'PENDING', APPROVED: 'APPROVED', REJECTED: 'REJECTED' };
    const statusKey = String(statusRaw).toUpperCase();
    const normalized = map[statusKey] || 'PENDING';
    const user = await User.findOne({ kycReferenceId: ref, kycProvider: provider });
    if (!user) return res.status(404).json({ error: 'user_not_found' });
    user.kycStatus = normalized;
    await user.save();
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'kyc_webhook_failed' });
  }
});

export default router;
