import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";
import { createError } from "../error.js";
import User from "../models/User.js";
import Workout from "../models/Workout.js";
import Tutorial from "../models/Tutorial.js";
import Blog from "../models/Blog.js";

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
    console.log(user);
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
    console.log(`Fetching tutorials for user ${userId}, found ${tutorials.length}`);
    return res.status(200).json(tutorials);
  } catch (err) {
    next(err);
  }
};

export const getBlogs = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const blogs = await Blog.find({ user: userId });
    console.log(`Fetching blogs for user ${userId}, found ${blogs.length}`);
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
  console.log(`Adding for category ${category}, mapped to ${mappedCategory}`);

  const tutorialsData = {
    Legs: [
      { title: "Leg Day Workout for Beginners", url: "https://www.youtube.com/watch?v=1f8yoFFdkNk", thumbnail: "https://img.youtube.com/vi/1f8yoFFdkNk/0.jpg" },
      { title: "Advanced Leg Exercises", url: "https://www.youtube.com/watch?v=2SHsk9AzdjA", thumbnail: "https://img.youtube.com/vi/2SHsk9AzdjA/0.jpg" },
      { title: "Squats and Lunges Tutorial", url: "https://www.youtube.com/watch?v=Dy28eq2PjcM", thumbnail: "https://img.youtube.com/vi/Dy28eq2PjcM/0.jpg" },
    ],
    Arms: [
      { title: "Bicep Curls Tutorial", url: "https://www.youtube.com/watch?v=ykJmrZ5v0Oo", thumbnail: "https://img.youtube.com/vi/ykJmrZ5v0Oo/0.jpg" },
      { title: "Tricep Dips Guide", url: "https://www.youtube.com/watch?v=6kALZikXxLc", thumbnail: "https://img.youtube.com/vi/6kALZikXxLc/0.jpg" },
      { title: "Shoulder Press Workout", url: "https://www.youtube.com/watch?v=qEwKCR5JCog", thumbnail: "https://img.youtube.com/vi/qEwKCR5JCog/0.jpg" },
    ],
    Chest: [
      { title: "Chest Workout for Mass", url: "https://www.youtube.com/watch?v=VmB1G1K7v94", thumbnail: "https://img.youtube.com/vi/VmB1G1K7v94/0.jpg" },
      { title: "Bench Press Tutorial", url: "https://www.youtube.com/watch?v=SCVCLChPQFY", thumbnail: "https://img.youtube.com/vi/SCVCLChPQFY/0.jpg" },
      { title: "Push-Up Variations", url: "https://www.youtube.com/watch?v=IODxDxX7oi4", thumbnail: "https://img.youtube.com/vi/IODxDxX7oi4/0.jpg" },
    ],
    Back: [
      { title: "Back Workout Routine", url: "https://www.youtube.com/watch?v=9H1FmZBkF7E", thumbnail: "https://img.youtube.com/vi/9H1FmZBkF7E/0.jpg" },
      { title: "Pull-Up Guide", url: "https://www.youtube.com/watch?v=eGo4IYlbE5g", thumbnail: "https://img.youtube.com/vi/eGo4IYlbE5g/0.jpg" },
      { title: "Deadlift Form", url: "https://www.youtube.com/watch?v=ytGaGIn3SjE", thumbnail: "https://img.youtube.com/vi/ytGaGIn3SjE/0.jpg" },
    ],
    Abs: [
      { title: "Ab Workout for Beginners", url: "https://www.youtube.com/watch?v=6sFkXH8r8jY", thumbnail: "https://img.youtube.com/vi/6sFkXH8r8jY/0.jpg" },
      { title: "Plank Variations", url: "https://www.youtube.com/watch?v=ASdvN_XEl_c", thumbnail: "https://img.youtube.com/vi/ASdvN_XEl_c/0.jpg" },
      { title: "Crunches and Sit-Ups", url: "https://www.youtube.com/watch?v=Xyd_fa5zoEU", thumbnail: "https://img.youtube.com/vi/Xyd_fa5zoEU/0.jpg" },
    ],
    Cardio: [
      { title: "HIIT Workout", url: "https://www.youtube.com/watch?v=ml6cT4AZdqI", thumbnail: "https://img.youtube.com/vi/ml6cT4AZdqI/0.jpg" },
      { title: "Running Tips", url: "https://www.youtube.com/watch?v=_kGESn8ArrU", thumbnail: "https://img.youtube.com/vi/_kGESn8ArrU/0.jpg" },
      { title: "Jump Rope Exercises", url: "https://www.youtube.com/watch?v=1b98WrRrmUs", thumbnail: "https://img.youtube.com/vi/1b98WrRrmUs/0.jpg" },
    ],
    "Full Body": [
      { title: "Full Body Workout", url: "https://www.youtube.com/watch?v=CLd6W0QZBzE", thumbnail: "https://img.youtube.com/vi/CLd6W0QZBzE/0.jpg" },
      { title: "Bodyweight Exercises", url: "https://www.youtube.com/watch?v=3p8EBPVZ2Iw", thumbnail: "https://img.youtube.com/vi/3p8EBPVZ2Iw/0.jpg" },
      { title: "Circuit Training", url: "https://www.youtube.com/watch?v=2pjCKU8JGLU", thumbnail: "https://img.youtube.com/vi/2pjCKU8JGLU/0.jpg" },
    ],
    // Add more categories as needed
  };

  const blogsData = {
    Legs: [
      { title: "The Ultimate Guide to Leg Workouts", url: "https://www.bodybuilding.com/content/the-ultimate-guide-to-leg-workouts.html", excerpt: "Learn how to build strong legs with these exercises." },
      { title: "Benefits of Squats", url: "https://www.healthline.com/health/fitness/squat-benefits", excerpt: "Why squats are essential for leg development." },
      { title: "Leg Day Recovery Tips", url: "https://www.menshealth.com/fitness/a19537083/leg-day-recovery/", excerpt: "How to recover faster after intense leg workouts." },
    ],
    Arms: [
      { title: "Building Bigger Arms", url: "https://www.bodybuilding.com/content/how-to-build-bigger-arms.html", excerpt: "Tips for increasing arm size and strength." },
      { title: "Bicep vs Tricep Training", url: "https://www.muscleandstrength.com/articles/biceps-vs-triceps-training", excerpt: "Balancing your arm workouts." },
      { title: "Arm Workout Routines", url: "https://www.healthline.com/health/fitness/arm-workout-routines", excerpt: "Sample routines for arm days." },
    ],
    Chest: [
      { title: "Chest Development Guide", url: "https://www.bodybuilding.com/content/chest-development-guide.html", excerpt: "Complete guide to developing a bigger, stronger chest." },
      { title: "Best Chest Exercises", url: "https://www.muscleandstrength.com/articles/chest-exercises", excerpt: "Top exercises for chest growth." },
      { title: "Chest Workout Science", url: "https://www.healthline.com/health/fitness/chest-exercises", excerpt: "The science behind effective chest training." },
    ],
    Back: [
      { title: "Back Workout Guide", url: "https://www.bodybuilding.com/content/back-workout-guide.html", excerpt: "Build a strong and muscular back with the right training." },
      { title: "Deadlift Guide", url: "https://www.stronglifts.com/deadlift/", excerpt: "Master the deadlift for back strength." },
      { title: "Pull-Up Progression", url: "https://www.muscleandstrength.com/articles/pullups", excerpt: "Step-by-step guide to mastering pull-ups." },
    ],
    Abs: [
      { title: "Six Pack Abs Guide", url: "https://www.bodybuilding.com/content/six-pack-abs-guide.html", excerpt: "Everything you need to know about getting six-pack abs." },
      { title: "Core Training Fundamentals", url: "https://www.healthline.com/health/fitness/core-exercises", excerpt: "Build a strong core with effective exercises." },
      { title: "Ab Nutrition", url: "https://www.muscleandstrength.com/articles/abs-nutrition", excerpt: "How diet affects your abdominal definition." },
    ],
    Cardio: [
      { title: "Cardio Training Benefits", url: "https://www.healthline.com/health/fitness/benefits-of-cardio", excerpt: "Why cardiovascular training is essential for health." },
      { title: "HIIT vs Steady Cardio", url: "https://www.bodybuilding.com/content/hiit-vs-steady-state-cardio.html", excerpt: "Comparing different cardio training methods." },
      { title: "Running Training Plan", url: "https://www.runnersworld.com/training", excerpt: "Structured plans for runners of all levels." },
    ],
    "Full Body": [
      { title: "Full Body Workout Benefits", url: "https://www.bodybuilding.com/content/full-body-workout-benefits.html", excerpt: "Why full body training is effective." },
      { title: "Compound Exercise Guide", url: "https://www.healthline.com/health/fitness/compound-exercises", excerpt: "Master compound movements for total body strength." },
      { title: "Programming Full Body Workouts", url: "https://www.muscleandstrength.com/articles/full-body-workouts", excerpt: "How to program effective full body training." },
    ],
    // Add more categories as needed
  };

  const tutorials = tutorialsData[mappedCategory] || [];
  const blogs = blogsData[mappedCategory] || [];
  console.log(`Tutorials: ${tutorials.length}, Blogs: ${blogs.length}`);

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
