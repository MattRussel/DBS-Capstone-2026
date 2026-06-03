// backend/routes/quizRoutes.js
import express from 'express';
import { 
  getNewQuizQuestions, 
  saveQuizScoreResult, 
  getQuizResults 
} from '../controllers/quizController.js'; 

const router = express.Router();

router.post('/start', getNewQuizQuestions);
router.post('/score', saveQuizScoreResult);
router.get('/results/:studentId', getQuizResults);

export default router;