import { Router } from 'express';
import { AboutUsController } from './aboutUs/aboutUs.controllers';
import auth from '../../middlewares/auth';
import { PrivacyPolicyController } from './privacyPolicy/privacyPolicy.controllers';
import { TermsConditionsController } from './termsConditions/termsConditions.controllers';
import { CSController } from './customerSupport/cs.controller';

const router = Router();
router
  .route('/about-us')
  .get(AboutUsController.getAboutUs)
  .post(auth('admin'), AboutUsController.createOrUpdateAboutUs);

router
  .route('/privacy-policy')
  .get(PrivacyPolicyController.getPrivacyPolicy)
  .post(auth('common'), PrivacyPolicyController.createOrUpdatePrivacyPolicy);
router
  .route('/terms-conditions')
  .get(TermsConditionsController.getTermsConditions)
  .post(auth('admin'), TermsConditionsController.createOrUpdateTermsConditions);

  //support and contact

  router.route('/support-and-contact')
  .get(CSController.getCS)
  .post(auth('common'),CSController.createOrUpdateCS)


export const SettingsRoutes = router;
