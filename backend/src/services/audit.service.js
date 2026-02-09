import AuditEvent from '../models/audit-event.model.js';

export const logAuditEvent = async (data) => {
  try {
    await AuditEvent.create({
      actorUserId: data.actorUserId,
      action: data.action,
      targetType: data.targetType,
      targetId: data.targetId,
      groupId: data.groupId,
      outcome: data.outcome,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      metadata: data.metadata,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
};
