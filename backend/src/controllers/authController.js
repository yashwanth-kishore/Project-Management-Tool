const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const getUserProfile = (row) => {
  const { password, ...safeUser } = row;
  return safeUser;
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json("Name must be at least 2 characters");
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json("Valid email is required");
    }
    if (!password || typeof password !== "string" || password.length < 8) {
      return res.status(400).json("Password must be at least 8 characters");
    }

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email.trim()]);
    if (existing.rows.length > 0) {
      return res.status(400).json("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users(name,email,password) VALUES($1,$2,$3) RETURNING *",
      [name.trim(), email.trim().toLowerCase(), hashedPassword]
    );

    const row = result.rows[0];
    
    // Create a default workspace for the user
    await pool.query(
      "INSERT INTO workspaces(name, owner_id) VALUES($1, $2)",
      ["Personal", row.id]
    );

    // Generate token so frontend can auto-login after registration
    const token = jwt.sign({ id: row.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      token,
      user: getUserProfile(row)
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json("Email and password are required");
    }

    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email.trim().toLowerCase()]);

    if (user.rows.length === 0) return res.status(401).json("Invalid email or password");

    const valid = await bcrypt.compare(password, user.rows[0].password);
    if (!valid) return res.status(401).json("Invalid email or password");

    const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({
      token,
      user: getUserProfile(user.rows[0]),
    });

  } catch (err) {
    res.status(500).json(err.message);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, job_title, phone, dob, bio, profile_pic } = req.body;
    
    // Explicit null assignments if undefined
    const d_dob = dob || null;

    const result = await pool.query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           job_title = COALESCE($2, job_title),
           phone = COALESCE($3, phone),
           dob = COALESCE($4, dob),
           bio = COALESCE($5, bio),
           profile_pic = COALESCE($6, profile_pic)
       WHERE id = $7
       RETURNING *`,
      [name, job_title, phone, d_dob, bio, profile_pic, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json("User not found");
    }

    res.json({ user: getUserProfile(result.rows[0]) });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await pool.query("SELECT * FROM users WHERE id = $1", [req.user.id]);
    if (user.rows.length === 0) return res.status(404).json("User not found");
    res.json({ user: getUserProfile(user.rows[0]) });
  } catch (err) {
    res.status(500).json(err.message);
  }
};
