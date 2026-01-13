import { Router } from 'express';
import {
  initiateGoogleOAuth,
  handleGoogleOAuthCallback,
  initiateFacebookOAuth,
  handleFacebookOAuthCallback,
} from '../controllers/oauth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Google OAuth routes
router.get('/google', authenticate, initiateGoogleOAuth);
router.get('/google/callback', handleGoogleOAuthCallback);

// Facebook OAuth routes
router.get('/facebook', authenticate, initiateFacebookOAuth);
router.get('/facebook/callback', handleFacebookOAuthCallback);

export default router;
