import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from 'fs';

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, userName, password } = req.body;
  console.log("Email:", email);

  if ([fullName, email, userName, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are compulsory");
  }

  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  console.log("Avatar Path:", avatarLocalPath);
  console.log("Cover Image Path:", coverImageLocalPath);

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  try {
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

    if (!avatar) {
      throw new ApiError(400, "Failed to upload avatar file");
    }

    const user = await User.create({
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      userName: userName.toLowerCase(),
    });

    const userCreated = await User.findById(user._id).select("-password -refreshToken");
    if (!userCreated) {
      throw new ApiError(500, "Something went wrong while registering user");
    }

    return res.status(201).json(new ApiResponse(200, userCreated, "User registered successfully"));
  } catch (err) {
    console.error("Error in registerUser:", err);
    throw err;
  } finally {
    // Clean up local files after upload or error
    try {
      if (avatarLocalPath && fs.existsSync(avatarLocalPath)) {
        fs.unlinkSync(avatarLocalPath);
      }
      if (coverImageLocalPath && fs.existsSync(coverImageLocalPath)) {
        fs.unlinkSync(coverImageLocalPath);
      }
    } catch (unlinkErr) {
      console.error("Error deleting local file:", unlinkErr);
      // Log the error, but don't throw to avoid overriding original error
    }
  }
});

export { registerUser };
