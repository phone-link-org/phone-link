import { Router } from "express";
import { UserLogin, UserSignup } from "../dto/users";
import { AppDataSource } from "../db";
import { User } from "../typeorm/users.entity";
import bcrypt from "bcrypt";

const router = Router();

router.post("/signup", async (req, res) => {
  const signupData: UserSignup = req.body;

  try {
    await AppDataSource.transaction(async (transactionEntityManager) => {
      const existing = await transactionEntityManager.findOne(User, {
        where: { email: signupData.email, id: signupData.id },
      });

      if (existing) {
        res.status(400).json({ message: "this email is already signed up" });
      }

      const newUser = new User();
      newUser.email = signupData.email;
      newUser.id = signupData.id;
      newUser.password = await bcrypt.hash(signupData.password, 10);
      newUser.name = signupData.name;
      newUser.phone_number = signupData.phoneNumber;
      newUser.address = signupData.address;
      newUser.gender = signupData.gender;
      newUser.role = signupData.role;

      await transactionEntityManager.save(newUser);
    });
    res.status(201).json({ message: "Successfully signed up!" });
  } catch (error) {
    console.error("Failed to create new user!", error);
    res.status(400).json({ message: "Failed to signed up. Check the body" });
  }
});

router.post("/login", async (req, res) => {
  const loginData: UserLogin = req.body;

  try {
    const user = await AppDataSource.getRepository(User).findOne({
      where: {
        id: loginData.id,
      },
    });
    if (!user) {
      res.status(401).json({ message: `can't find user ${loginData.id}` });
      return;
    }

    const isMatch = await bcrypt.compare(loginData.password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Password is incorrect" });
      return;
    }
    res.status(200).json({ message: `${user.id} logged in.` });
  } catch (error) {
    console.error("Failed to Login", error);
    res.status(500).json({ message: "Failed to Login." });
  }
});

export default router;
