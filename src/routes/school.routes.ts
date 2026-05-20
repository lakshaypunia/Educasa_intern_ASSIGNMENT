import { Router } from 'express';
import { addSchool, listSchools } from '../controllers/school.controller';
import { validateBody, validateQuery } from '../middleware/validate';
import { addSchoolSchema, listSchoolsSchema } from '../types/school.types';

const router = Router();

router.post('/addSchool', validateBody(addSchoolSchema), addSchool);
router.get('/listSchools', validateQuery(listSchoolsSchema), listSchools);

export default router;
