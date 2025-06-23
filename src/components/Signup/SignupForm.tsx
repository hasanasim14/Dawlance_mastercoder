"use client";

import type React from "react";
// import Link from "next/link";
import { useState } from "react";
import { branches, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  //   SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export const SignupForm = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    setErrors((prev) => ({
      ...prev,
      [id]: value.trim() === "" ? "This field is required" : "",
    }));

    if (id === "email" && value.trim() !== "") {
      setErrors((prev) => ({
        ...prev,
        email: isValidEmail(value) ? "" : "Invalid email format",
      }));
    }
  };

  const handleLogin = async () => {
    console.log("Inside the login method");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (res.ok) {
        toast.success("Login Successful");
      }

      if (!res.ok) {
        toast.error("Incorrect email or password");
      }
    } catch (error) {
      console.error("Login API failed, the error = ", error);
      toast.error("Login Failed. Please try again");
    }
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create Your Account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Fill in the information below to get started.
        </p>
      </div>
      <div className="grid gap-6">
        {/* Username */}
        <div className="grid gap-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="username"
            placeholder="your_username"
            autoComplete="username"
            required
            value={formData.username}
            // onChange={handleChange}
            // className={errors.email ? "border-red-500" : ""}
          />
        </div>

        {/* Email */}
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? "border-red-500" : ""}
          />

          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>
        {/* Password */}
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              className={`pr-10 ${errors.password ? "border-red-500" : ""}`}
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-black"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
          </div>
        </div>

        {/* Confirm Password */}
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Confirm Password</Label>
          </div>
          <div className="relative">
            <Input
              id="confirm_password"
              type="password"
              //   type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              //   className={`pr-10 ${errors.password ? "border-red-500" : ""}`}
              value={formData.confirm_password}
              //   onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-black"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
          </div>
        </div>

        {/* Role */}
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="Role">Role</Label>
          </div>
          <div className="relative">
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Branch">Branch</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Branch */}
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="Branch">Branch</Label>
          </div>
          <div className="relative">
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {branches.map(({ label, value }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                  {/* <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Branch">Branch</SelectItem> */}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleLogin}
          className="w-full"
          disabled={!formData.email || !formData.password || !!errors.email}
        >
          Sign Up
        </Button>
      </div>
    </form>
  );
};
