import React from "react";
import { BarChart } from "@mui/x-charts/BarChart";

const WeeklyStatCard = ({ data }) => {
  return (
    <div className="flex-1 min-w-[280px] p-6 bg-white border border-neutral-200 rounded-2xl shadow-md flex flex-col gap-4">
      <h3 className="font-bold text-sm text-primary uppercase tracking-wider">Weekly Calories Burned</h3>
      {data?.totalWeeksCaloriesBurnt && (
        <div className="w-full h-[300px]">
          <BarChart
            xAxis={[
              { 
                scaleType: "band", 
                data: data?.totalWeeksCaloriesBurnt?.weeks || [],
                tickLabelStyle: { fontSize: 10, fill: '#666' } 
              },
            ]}
            series={[
              { 
                data: data?.totalWeeksCaloriesBurnt?.caloriesBurned || [],
                color: '#5B8FB9' 
              }
            ]}
            height={300}
            margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
          />
        </div>
      )}
    </div>
  );
};

export default WeeklyStatCard;
