import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, userName, password } = req.body;
  console.log("Email :", email);

  if (
    [fullName, email, userName, password].some((feild) => feild?.trim() === "")
  ) {
    throw new ApiError(400, "All feild are compolsory");
  }
  const existedUser = User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "user already exist");
  }
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  if(!avatarLocalPath){
    throw new ApiError(400,"avatar file is required")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const covereImage = await uploadOnCloudinary(coverImageLocalPath)

  if(!avatar){
    throw new ApiError(400,"avatar file is required")
  }

  const user = await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:covereImage?.url || "",
    email,
    password,
    userName:userName.toLowerCase(),
  })

  const userCreated = await User.findById(user._id).select("-password -refreshTocken")
  if(!userCreated){
    throw new ApiError(500, "something went wrong while registering user")
  }

  return res.status(201).json(
    new ApiResponse(200,userCreated , "user registerd successfully")
  )
});

export { registerUser };
