import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

export const register = async (req, res) => {
  //dboperation
  const { username, email, password } = req.body;

  try {
    //HASH PASSWORD

    const hashPassword = await bcrypt.hash(password, 10);

    //CREATE NEW USER AND SAVE

    const newUser = await prisma.user.create({
      data: { username, email, password: hashPassword },
    });

    res.status(200).json({ message: 'User Created Successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Failed to create User!' });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    //Check If the User Exists

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res
        .status(401)
        .json({ message: 'Invalid Credentials!' });
    }

    //Check if password is correct

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid)
      return res
        .status(401)
        .json({ message: 'Invalid Credentials!' });
    //Generate cookie token and send it to user

    // res.setHeader('Set-Cookie', 'test=' + 'myValue').json('success');
    const age = 1000 * 60 * 60 * 24 * 7;
    const token = jwt.sign(
      {
        id: user.id,
        isAdmin: true,
      },
      process.env.JWT_SECRETE_KEY,
      {
        expiresIn: age,
      }
    );

    const { password: userPassword, ...userInfo } = user;

    res
      .cookie('token', token, {
        httpOnly: true,
        //secure: true,
        maxAge: age,
      })
      .status(200)
      .json(userInfo);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Failed to Login!' });
  }
};

export const logout = (req, res) => {
  res
    .clearCookie('token')
    .status(200)
    .json({ message: 'Logout Successful!' });
};
