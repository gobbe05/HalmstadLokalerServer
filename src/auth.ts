// auth.ts
import passport from "passport"
import {Strategy as LocalStrategy} from "passport-local"
import User, { IUser } from "./models/userModel";

passport.use(
    new LocalStrategy(async (username, password, done) => {
        try{
            const user: IUser | null = await User.findOne({username})
            if(!user) return done(null, false, {message: "Incorrect username."})

            const isMatch = await user.comparePassword(password);
            if(!isMatch) return done(null, false, {message: "Incorrect password"})

            // If passwords match, return the user object
            return done(null, user)
        } catch(e) {
            return done(e)
        }
    })
)

// Serialize user
passport.serializeUser((user, done) => {
    done(null, (user as IUser).id)
})

// Deserialize user
passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await User.findOne({_id: id})
        done(null, user || null);
    } catch(e) {
        done(e);
    }
})

export default passport