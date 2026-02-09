import { logAuditEvent } from '../services/audit.service.js';

export const auditMiddleware = (req, res, next) => {
    req.audit = async (data) => {
        const auditData = {
            actorUserId: req.user ? req.user.id : null,
            ipAddress: req.ip || req.socket.remoteAddress,
            userAgent: req.get('User-Agent'),
            ...data
        };
        await logAuditEvent(auditData);
    };
    next();
};
