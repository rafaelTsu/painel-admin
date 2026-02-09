import * as authService from '../services/auth.service.js';
import { loginSchema } from '../validations/auth.validator.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = await loginSchema.validateAsync(req.body);
    const { user, accessToken, refreshToken } = await authService.login(email, password);

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Request audit
    await req.audit({
        action: 'auth.login.success',
        targetType: 'user',
        targetId: user.id,
        outcome: 'success',
        metadata: { email }
    });

    res.json({ accessToken, user });
  } catch (err) {
      // Audit failure if email provided
      if (req.body.email) {
         try {
             // We can't use req.audit here fully if we don't have a user, 
             // but audit middleware might have attached the helper.
             // Helper uses req.user which is null. That's fine.
            await req.audit({
                action: 'auth.login.failure',
                targetType: 'user',
                targetId: req.body.email, // Use email as ID for failure
                outcome: 'failure',
                metadata: { email: req.body.email, error: err.message }
            }); 
         } catch (e) { /* ignore audit error */ }
      }
      next(err);
  }
};

export const refresh = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) throw new Error('No refresh token');
        
        const { accessToken } = await authService.refresh(refreshToken);
        res.json({ accessToken });
    } catch (err) {
        res.clearCookie('refreshToken');
        next(err); 
    }
};

export const logout = async (req, res, next) => {
    res.clearCookie('refreshToken');
    res.status(204).send();
};

export const me = (req, res) => {
    res.json({ user: req.user });
};
