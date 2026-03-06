import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";
import { createError } from "../error.js";
import User from "../models/User.js";
import Workout from "../models/Workout.js";
import Tutorial from "../models/Tutorial.js";
import Blog from "../models/Blog.js";
import { tutorialsData, blogsData } from "../utils/data.js";

dotenv.config();

export const UserRegister = async (req, res, next) => {
  try {
    const { email, password, name, img } = req.body;

    // Check if the email is in use
    const existingUser = await User.findOne({ email }).exec();
    if (existingUser) {
      return next(createError(409, "Email is already in use."));
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      img,
    });
    const createdUser = await user.save();
    const token = jwt.sign({ id: createdUser._id }, process.env.JWT, {
      expiresIn: "9999 years",
    });
    return res.status(200).json({ token, user });
  } catch (error) {
    return next(error);
  }
};

export const UserLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    // Check if user exists
    if (!user) {
      return next(createError(404, "User not found"));
    }
    // Check if password is correct
    const isPasswordCorrect = await bcrypt.compareSync(password, user.password);
    if (!isPasswordCorrect) {
      return next(createError(403, "Incorrect password"));
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT, {
      expiresIn: "9999 years",
    });

    return res.status(200).json({ token, user });
  } catch (error) {
    return next(error);
  }
};

export const getUserDashboard = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);
    if (!user) {
      return next(createError(404, "User not found"));
    }

    const currentDateFormatted = new Date();
    const startToday = new Date(
      currentDateFormatted.getFullYear(),
      currentDateFormatted.getMonth(),
      currentDateFormatted.getDate()
    );
    const endToday = new Date(
      currentDateFormatted.getFullYear(),
      currentDateFormatted.getMonth(),
      currentDateFormatted.getDate() + 1
    );

    //calculte total calories burnt
    const totalCaloriesBurnt = await Workout.aggregate([
      { $match: { user: user._id, date: { $gte: startToday, $lt: endToday } } },
      {
        $group: {
          _id: null,
          totalCaloriesBurnt: { $sum: "$caloriesBurned" },
        },
      },
    ]);

    //Calculate total no of workouts
    const totalWorkouts = await Workout.countDocuments({
      user: userId,
      date: { $gte: startToday, $lt: endToday },
    });

    //Calculate average calories burnt per workout
    const avgCaloriesBurntPerWorkout =
      totalCaloriesBurnt.length > 0
        ? totalCaloriesBurnt[0].totalCaloriesBurnt / totalWorkouts
        : 0;

    // Fetch category of workouts
    const categoryCalories = await Workout.aggregate([
      { $match: { user: user._id, date: { $gte: startToday, $lt: endToday } } },
      {
        $group: {
          _id: "$category",
          totalCaloriesBurnt: { $sum: "$caloriesBurned" },
        },
      },
    ]);

    //Format category data for pie chart

    const pieChartData = categoryCalories.map((category, index) => ({
      id: index,
      value: category.totalCaloriesBurnt,
      label: category._id,
    }));

    const weeks = [];
    const caloriesBurnt = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(
        currentDateFormatted.getTime() - i * 24 * 60 * 60 * 1000
      );
      weeks.push(`${date.getDate()}th`);

      const startOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      const endOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + 1
      );

      const weekData = await Workout.aggregate([
        {
          $match: {
            user: user._id,
            date: { $gte: startOfDay, $lt: endOfDay },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            totalCaloriesBurnt: { $sum: "$caloriesBurned" },
          },
        },
        {
          $sort: { _id: 1 }, // Sort by date in ascending order
        },
      ]);

      caloriesBurnt.push(
        weekData[0]?.totalCaloriesBurnt ? weekData[0]?.totalCaloriesBurnt : 0
      );
    }

    return res.status(200).json({
      totalCaloriesBurnt:
        totalCaloriesBurnt.length > 0
          ? totalCaloriesBurnt[0].totalCaloriesBurnt
          : 0,
      totalWorkouts: totalWorkouts,
      avgCaloriesBurntPerWorkout: avgCaloriesBurntPerWorkout,
      totalWeeksCaloriesBurnt: {
        weeks: weeks,
        caloriesBurned: caloriesBurnt,
      },
      pieChartData: pieChartData,
    });
  } catch (err) {
    next(err);
  }
};

export const getWorkoutsByDate = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);
    let date = req.query.date ? new Date(req.query.date) : new Date();
    if (!user) {
      return next(createError(404, "User not found"));
    }
    const startOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const endOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + 1
    );

    const todaysWorkouts = await Workout.find({
      userId: userId,
      date: { $gte: startOfDay, $lt: endOfDay },
    });
    const totalCaloriesBurnt = todaysWorkouts.reduce(
      (total, workout) => total + workout.caloriesBurned,
      0
    );

    return res.status(200).json({ todaysWorkouts, totalCaloriesBurnt });
  } catch (err) {
    next(err);
  }
};

export const getTutorials = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const tutorials = await Tutorial.find({ user: userId });
    return res.status(200).json(tutorials);
  } catch (err) {
    next(err);
  }
};

export const getBlogs = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const blogs = await Blog.find({ user: userId });
    return res.status(200).json(blogs);
  } catch (err) {
    next(err);
  }
};

export const addWorkout = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return next(createError(401, "Unauthorized"));
    const user = await User.findById(userId);
    if (!user) return next(createError(404, "User not found"));
    const { workoutString } = req.body;
    if (!workoutString) {
      return next(createError(400, "Workout string is missing"));
    }
    // Split workoutString into blocks by #
    const workoutBlocks = workoutString.split("#").filter((block) => block.trim());
    if (workoutBlocks.length === 0) {
      return next(createError(400, "No workouts found in workout string"));
    }

    const parsedWorkouts = [];
    for (const block of workoutBlocks) {
      const lines = block.split("\n").map((line) => line.trim()).filter((line) => line);
      if (lines.length < 5) {
        return next(createError(400, "Incomplete workout details"));
      }
      const category = lines[0];
      const workoutDetails = parseWorkoutLine(lines.slice(1));
      if (workoutDetails == null) {
        return next(createError(400, "Please enter in proper format"));
      }
      workoutDetails.category = category;
      parsedWorkouts.push(workoutDetails);
    }

    // Calculate calories burnt for each workout
    for (const workout of parsedWorkouts) {
      workout.caloriesBurned = parseFloat(calculateCaloriesBurnt(workout));
      await Workout.create({ ...workout, user: userId });
    }

    // Get unique categories
    const uniqueCategories = [...new Set(parsedWorkouts.map(w => w.category))];

    // Delete existing tutorials and blogs for the user
    await Tutorial.deleteMany({ user: userId });
    await Blog.deleteMany({ user: userId });

    // Add tutorials and blogs for each category
    for (const category of uniqueCategories) {
      await addTutorialsAndBlogs(category, userId);
    }

    return res.status(201).json({
      message: "Workouts added successfully",
      workouts: parsedWorkouts,
    });
  } catch (err) {
    next(err);
  }
};

// Function to add tutorials and blogs for a category
const addTutorialsAndBlogs = async (category, userId) => {
  // Map categories to standard ones
  const categoryMap = {
    "biceps": "Arms",
    "triceps": "Arms",
    "shoulders": "Arms",
    "forearms": "Arms",
    "legs": "Legs",
    "quads": "Legs",
    "hamstrings": "Legs",
    "calves": "Legs",
    "chest": "Chest",
    "back": "Back",
    "abs": "Abs",
    "cardio": "Cardio",
    "full body": "Full Body",
    // Add more mappings as needed
  };
  const mappedCategory = categoryMap[category] || category;

  const tutorials = tutorialsData[mappedCategory] || [];
  const blogs = blogsData[mappedCategory] || [];

  for (const tut of tutorials) {
    await Tutorial.create({ ...tut, category, user: userId });
  }

  for (const blog of blogs) {
    await Blog.create({ ...blog, category, user: userId });
  }
};

// Function to calculate calories burnt for a workout
const calculateCaloriesBurnt = (workoutDetails) => {
  const durationInMinutes = parseInt(workoutDetails.duration);
  const weightInKg = parseInt(workoutDetails.weight);
  const caloriesBurntPerMinute = 5; // Sample value, actual calculation may vary
  return durationInMinutes * caloriesBurntPerMinute * weightInKg;
};

// Function to parse workout details from a line
const parseWorkoutLine = (parts) => {
  const details = {};
  if (parts.length >= 4) {
    details.workoutName = parts[0].substring(1).trim();
    details.sets = parseInt(parts[1].split("sets")[0].substring(1).trim());
    details.reps = parseInt(
      parts[1].split("sets")[1].split("reps")[0].substring(1).trim()
    );
    details.weight = parseFloat(parts[2].split("kg")[0].substring(1).trim());
    details.duration = parseFloat(parts[3].split("min")[0].substring(1).trim());
    return details;
  }
  return null;
};
