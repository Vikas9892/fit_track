import React from "react";
import TextInput from "./TextInput";
import Button from "./Button";

const AddWorkout = ({ workout, setWorkout, addNewWorkout, buttonLoading }) => {
  return (
    <div className="flex-1 min-w-[280px] p-4 sm:p-6 border border-neutral-200 rounded-xl shadow-[1px_6px_20px_0px_rgba(0,122,255,0.15)] flex flex-col gap-1.5 bg-white">
      <h2 className="font-semibold text-sm sm:text-base text-primary">Add New Workout</h2>
      <TextInput
        label="Workout Details"
        textArea
        rows={10}
        placeholder={`Enter in this format:

#Category
-Workout Name
-Sets
-Reps
-Weight
-Duration`}
        value={workout}
        handelChange={(e) => setWorkout(e.target.value)}
      />
      <Button
        text="Add Workout"
        small
        onClick={() => addNewWorkout()}
        isLoading={buttonLoading}
        isDisabled={buttonLoading}
        full
      />
    </div>
  );
};

export default AddWorkout;
