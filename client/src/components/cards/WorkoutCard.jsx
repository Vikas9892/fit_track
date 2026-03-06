import { FitnessCenterRounded, TimelapseRounded } from "@mui/icons-material";
import React from "react";

const WorkoutCard = ({ workout }) => {
  return (
    <div className="flex-1 min-w-[250px] max-w-[400px] p-4 md:p-5 bg-white border border-neutral-200 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-2">
      <div className="w-fit text-sm text-primary font-semibold bg-primary/10 px-2.5 py-1 rounded-md mb-1">
        #{workout?.category}
      </div>
      <div className="text-xl text-neutral-800 font-bold leading-tight uppercase tracking-tight">
        {workout?.workoutName}
      </div>
      <div className="text-sm font-medium text-neutral-500">
        Sets: {workout?.sets} × {workout?.reps} reps
      </div>
      <div className="flex gap-4 mt-2 border-t border-neutral-100 pt-3">
        <div className="text-sm font-bold text-neutral-800 flex items-center gap-1.5">
          <FitnessCenterRounded className="text-primary" sx={{ fontSize: "18px" }} />
          {workout?.weight} kg
        </div>
        <div className="text-sm font-bold text-neutral-800 flex items-center gap-1.5">
          <TimelapseRounded className="text-secondary" sx={{ fontSize: "18px" }} />
          {workout?.duration} min
        </div>
      </div>
    </div>
  );
};

export default WorkoutCard;
