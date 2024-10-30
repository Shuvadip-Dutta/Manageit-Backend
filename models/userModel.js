const mongoose=require('mongoose')
const bcrypt=require('bcrypt')

// Define the User schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    dob:{
        type: Date,
        require: true
    },
    phoneNum:{
        type: String,
        require: true
    },
    password: {
        type:String,
        required:true
    }
});

//Hash
userSchema.pre('save', async function (next) {
    if(!this.isModified('password')) return next();

    const salt= await bcrypt.genSalt(10);
    this.password=await bcrypt.hash(this.password,salt);
    next();
    
})

// Checking
userSchema.methods.comparePassword= async function (candidatePassword) {
    return bcrypt.compare(candidatePassword,this.password);
};

//Export
module.exports= mongoose.model('User', userSchema)