import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 500,
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: (arr) => arr.length >= 2 && arr.length <= 6,
      message: "Questions must have 2-6 options",
    },
  },
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
  },
  timeLimit: {
    type: Number,
    default: 30,
    min: 5,
    max: 120,
  },
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 100,
  },
  description: {
    type: String,
    maxlength: 500,
  },
  questions: [questionSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add index for better query performance
quizSchema.index({ title: "text", description: "text" });

export default mongoose.model("Quiz", quizSchema);
