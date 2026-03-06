import React from "react";

const CountsCard = ({ item, data }) => {
  return (
    <div className="flex-1 min-w-[200px] p-6 bg-white border border-neutral-200 rounded-2xl shadow-md flex gap-2 transition-all duration-300 hover:shadow-lg">
      <div className="flex-1 flex flex-col gap-3">
        <h3 className="font-bold text-sm text-primary uppercase tracking-wider">{item.name}</h3>
        <div className="font-bold text-2xl md:text-3xl flex items-baseline gap-2 text-neutral-800">
          {data ? data[item.key]?.toFixed(1) : "0"}
          <span className="text-sm font-normal text-neutral-400">{item.unit}</span>
          <span className="text-xs font-semibold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded ml-1">
            +12%
          </span>
        </div>
        <p className="text-xs text-neutral-500 leading-relaxed font-medium">
          {item.desc}
        </p>
      </div>
      <div 
        className="h-fit p-3 flex items-center justify-center rounded-xl shadow-inner"
        style={{ backgroundColor: item.lightColor, color: item.color }}
      >
        {React.cloneElement(item.icon, { sx: { fontSize: "28px" } })}
      </div>
    </div>
  );
};

export default CountsCard;
