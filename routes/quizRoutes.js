import express from "express";
import {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  deleteQuiz,
} from "../controllers/quizController.js";

const router = express.Router();

// Create a new quiz
router.post("/", createQuiz);

// Get all quizzes
router.get("/", getAllQuizzes);

// Get a single quiz
router.get("/:id", getQuizById);

// Delete a quiz
router.delete("/:id", deleteQuiz);

export default router;
