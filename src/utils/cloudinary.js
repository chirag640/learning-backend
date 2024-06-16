import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

cloudinary.config({ 
    cloud_name: process_params.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process_params.env.CLOUDINARY_API_KEY, 
    api_secret: process_params.env.CLOUDINARY_API_SECRET // Click 'View Credentials' below to copy your API secret
});


const uploadOnCloudinary = async (localFilePath) =>{
    try{
        if(!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type : "auto", 
        })
        console.log("file uploaded successfully" , response.url);
        return response;   
    }
    catch(err){
        fs.unlinkSync(localFilePath);
        return null;
        console.log(err)
    }
}