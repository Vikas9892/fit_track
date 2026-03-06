import React, { useEffect, useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { getWorkouts } from "../api";
import { useSelector } from "react-redux";
import WorkoutCard from "../components/cards/WorkoutCard";
import { CircularProgress } from "@mui/material";

const Workouts = () => {
  const currentUser = useSelector((state) => state.user.currentUser);
  const [todaysWorkouts, setTodaysWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState("");

  const getTodaysWorkout = async () => {
    setLoading(true);
    const token = localStorage.getItem("fittrack-app-token");
    const dateQuery = date ? `?date=${date}` : "";
    await getWorkouts(token, dateQuery).then((res) => {
      setTodaysWorkouts(res?.data?.todaysWorkouts || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (currentUser) {
      getTodaysWorkout();
    }
  }, [date, currentUser]);

  return (
    <div className="flex-1 min-h-screen flex justify-center py-6 px-4 bg-neutral-50 overflow-y-auto">
      <div className="flex-1 max-w-[1400px] flex flex-col md:flex-row gap-6">
        {/* Left Side - Date Calendar */}
        <div className="flex-1 md:max-w-xs flex flex-col gap-4">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
            <h2 className="text-lg font-bold text-neutral-800 mb-4 px-1">Select Date</h2>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar
                onChange={(e) => setDate(`${e.$M + 1}/${e.$D}/${e.$y}`)}
                className="!w-full"
              />
            </LocalizationProvider>
          </div>
        </div>

        {/* Right Side - Workouts List */}
        <div className="flex-[3] flex flex-col gap-6 px-1">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-semibold text-neutral-800">
              {date ? `Workouts for ${date}` : "Today's Progress"}
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <CircularProgress />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
              {todaysWorkouts.length > 0 ? (
                todaysWorkouts.map((workout) => (
                  <WorkoutCard key={workout._id} workout={workout} />
                ))
              ) : (
                <div className="col-span-full py-32 text-center text-neutral-400 border border-dashed border-neutral-300 rounded-xl bg-white">
                  No workouts found for this date.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Workouts;
