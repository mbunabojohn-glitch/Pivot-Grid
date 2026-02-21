export function listAuditLogs(req, res) {
  const { accountId } = req.query || {};
  res.json({ data: [], message: 'Audit logs stub', accountId });
}
