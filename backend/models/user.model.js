import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        name: { 
            type: String, 
            required: [true, "Name is required"] 
        },
        email: { 
            type: String, 
            required: [true, "Email is required"], 
            unique: true,
            lowercase: true,
            trim: true 
        },
        password: { 
            type: String, 
            required: [true, "Password is required"], 
            minlength: [6, "Password must be at least 6 characters long"] 
        },
        cartItems: [
            {
                quantity: { type: Number, default: 1 },
                product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }
            }
        ],
        role: { 
            type: String, 
            enum: ["customer", "admin"], 
            default: "customer" 
        }
    },
    { timestamps: true }
);

// Pre-save hook: පාස්වර්ඩ් එක සේව් වෙන්න කලින් Hash කරනවා
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw error;
    }
});

// Custom Method: ලොග් වෙද්දී පාස්වර්ඩ් එක චෙක් කරන්න
userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

// අන්තිමට විතරක් Model එක හදනවා
const User = mongoose.model("User", userSchema);

export default User;