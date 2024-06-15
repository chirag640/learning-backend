import mongoose , {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"


const userSchema = new Schema({
    username : {
        type : String,
        required : true,
        unique : true,
        index : true,
        trim: true,
        lowercase : true,
    },
    email : {
        type : String,
        required : true,
        unique : true,
        trim: true,
        lowercase : true,
    },
    fullname : {
        type : String,
        required : true,
        trim: true,
        index:true,
    },
    avatar:{
        type: String,
        required: true,
    },
    coverImage:{
        type:String,
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:'Video'
        }
    ],
    password:{
        type:String,
        required:[true,"password is required"],
    },
    refreshTocken:{
        type:String,
    }
    
    
},{timestamps:true})


userSchema.pre('save',async function(next){});
export const User = mongoose.model('User',userSchema);