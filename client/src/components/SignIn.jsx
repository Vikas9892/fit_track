import React, { useState } from "react";
import TextInput from "./TextInput";
import Button from "./Button";
import { UserSignIn } from "../api";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/reducers/userSlice";

const SignIn = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const validateInputs = () => {
    if (!email || !password) {
      alert("Please fill in all fields");
      return false;
    }
    return true;
  };

  const handelSignIn = async () => {
    setLoading(true);
    setButtonDisabled(true);
    if (validateInputs()) {
      await UserSignIn({ email, password })
        .then((res) => {
          dispatch(loginSuccess(res?.data));
          alert("Login Success");
          setLoading(false);
          setButtonDisabled(false);
        })
        .catch((err) => {
          const errorMessage = err.response?.data?.message || err.message || "An error occurred during sign in";
          alert(errorMessage);
          setLoading(false);
          setButtonDisabled(false);
        });
    }
  };

  return (
    <div className="w-full max-w-[500px] flex flex-col gap-9">
      <div>
        <h1 className="text-3xl font-extrabold text-neutral-800">Welcome to Fittrack 👋</h1>
        <p className="text-base font-normal text-neutral-500 mt-1">Please login with your details here</p>
      </div>
      <div className="flex flex-col gap-5">
        <TextInput
          label="Email Address"
          placeholder="Enter your email address"
          value={email}
          handelChange={(e) => setEmail(e.target.value)}
        />
        <TextInput
          label="Password"
          placeholder="Enter your password"
          password
          value={password}
          handelChange={(e) => setPassword(e.target.value)}
        />
        <Button
          text="SignIn"
          onClick={handelSignIn}
          isLoading={loading}
          isDisabled={buttonDisabled}
          full
        />
      </div>
    </div>
  );
};

export default SignIn;
