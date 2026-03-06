import React from "react";
import { PieChart } from "@mui/x-charts/PieChart";

const CategoryChart = ({ data }) => {
  return (
    <div className="flex-1 min-w-[280px] p-6 bg-white border border-neutral-200 rounded-2xl shadow-md flex flex-col gap-4">
      <h3 className="font-bold text-sm text-primary uppercase tracking-wider">Workout Distribution</h3>
      {data?.pieChartData && (
        <div className="w-full h-[300px] flex items-center justify-center">
          <PieChart
            series={[
              {
                data: data?.pieChartData || [],
                innerRadius: 40,
                outerRadius: 100,
                paddingAngle: 5,
                cornerRadius: 8,
              },
            ]}
            height={300}
            slotProps={{
              legend: {
                direction: 'row',
                position: { vertical: 'bottom', horizontal: 'center' },
                padding: 0,
                labelStyle: { fontSize: 10, fill: '#666' }
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CategoryChart;
