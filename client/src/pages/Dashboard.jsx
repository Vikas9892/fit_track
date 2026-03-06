import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { counts } from "../utils/data";
import CountsCard from "../components/cards/CountsCard";
import WeeklyStatCard from "../components/cards/WeeklyStatCard";
import CategoryChart from "../components/cards/CategoryChart";
import AddWorkout from "../components/AddWorkout";
import WorkoutCard from "../components/cards/WorkoutCard";
import { addWorkout, getDashboardDetails, getWorkouts } from "../api";

const Dashboard = () => {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.currentUser);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState();
  const [buttonLoading, setButtonLoading] = useState(false);
  const [todaysWorkouts, setTodaysWorkouts] = useState([]);
  const [workout, setWorkout] = useState(`#Legs
-Back Squat
-5 sets
-15 reps 
-30 kg
-10 min`);

  const dashboardData = async () => {
    setLoading(true);
    const token = localStorage.getItem("fittrack-app-token");
    await getDashboardDetails(token).then((res) => {
      setData(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  const getTodaysWorkout = async () => {
    const token = localStorage.getItem("fittrack-app-token");
    await getWorkouts(token, "").then((res) => {
      setTodaysWorkouts(res?.data?.todaysWorkouts || []);
    }).catch(err => console.error(err));
  };

  const addNewWorkout = async () => {
    setButtonLoading(true);
    const token = localStorage.getItem("fittrack-app-token");
    await addWorkout(token, { workoutString: workout })
      .then((res) => {
        if (res.data.workouts && res.data.workouts.length > 0) {
          const lastCategory = res.data.workouts[res.data.workouts.length - 1].category;
          localStorage.setItem("lastWorkoutCategory", lastCategory);
        }
        dashboardData();
        getTodaysWorkout();
        setButtonLoading(false);
        setWorkout("");
        // After adding, show the suggestions!
        navigate("/tutorials");
      })
      .catch((err) => {
        alert(err.response?.data?.message || err.message || "Error adding workout");
        setButtonLoading(false);
      });
  };

  useEffect(() => {
    if (currentUser) {
      dashboardData();
      getTodaysWorkout();
    }
  }, [currentUser]);

  return (
    <div className="flex-1 min-h-screen flex justify-center py-6 px-4 bg-neutral-50 overflow-y-auto">
      <div className="flex-1 max-w-[1400px] flex flex-col gap-6">
        <h1 className="text-xl md:text-2xl font-semibold text-neutral-800 px-1">Dashboard Overview</h1>
        
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-1">
          {counts.map((item, index) => (
            <CountsCard key={index} item={item} data={data} />
          ))}
        </div>

        {/* Charts & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-1">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <WeeklyStatCard data={data} />
            <CategoryChart data={data} />
          </div>
          <div className="lg:col-span-1">
            <AddWorkout
              workout={workout}
              setWorkout={setWorkout}
              addNewWorkout={addNewWorkout}
              buttonLoading={buttonLoading}
            />
          </div>
        </div>

        {/* Today's Workouts List */}
        <section className="flex flex-col gap-6 pb-20 px-1">
          <h2 className="text-lg md:text-xl font-semibold text-neutral-800">Today's Progress</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {todaysWorkouts.length > 0 ? (
              todaysWorkouts.map((workout) => (
                <WorkoutCard key={workout._id} workout={workout} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-neutral-400 border border-dashed border-neutral-300 rounded-xl bg-white">
                No workouts logged today yet. Start moving!
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
