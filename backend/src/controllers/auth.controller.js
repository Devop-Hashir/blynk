const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// shared email wrapper — logo centered, single sender identity
function emailWrapper(title, bodyHtml) {
  const LOGO_URL = "https://autohome-psi.vercel.app/favicon.png";
  return `
    <!DOCTYPE html>
    <html>
      <body style="margin:0;padding:0;background:#f0f0f0;font-family:'Segoe UI',sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f0f0;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;padding:40px;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" valign="middle">
                         <img src="${LOGO_URL}" width="64" height="64" alt="AutoHome Logo" style="display:block;border-radius:4px;" />
                       </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-size:22px;font-weight:700;color:#111;padding-bottom:12px;">
                    ${title}
                  </td>
                </tr>
                ${bodyHtml}
                <tr>
                  <td align="center" style="font-size:12px;color:#aaa;padding-top:24px;">
                    If you didn't request this, you can safely ignore this email.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

// ─── SIGNUP ───────────────────────────────────────
exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = new User({
      email,
      password: hashedPassword,
      verificationToken,
    });
    await user.save();

    // const verifyURL = `http://localhost:5000/api/auth/verify/${verificationToken}`
    const serverURL = process.env.SERVER_URL || "http://localhost:5000";
    const verifyURL = `${serverURL}/api/auth/verify/${verificationToken}`;

    const body = `
      <tr>
        <td align="center" style="color:#555;font-size:14px;padding-bottom:32px;">
          Click the button below to verify your email and activate your account.
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-bottom:16px;">
          <a href="${verifyURL}"
            style="display:inline-block;background:#3F8F3A;color:white;padding:12px 32px;border-radius:6px;font-weight:700;text-decoration:none;font-size:15px;">
            Verify Email
          </a>
        </td>
      </tr>
    `;

    await resend.emails.send({
      from: "AutoHome <onboarding@resend.dev>",
      to: email,
      subject: "Verify your AutoHome account",
      html: emailWrapper("Welcome to AutoHome!", body),
    });

    res
      .status(200)
      .json({ message: "Verification email sent! Please check your inbox." });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── VERIFY EMAIL ─────────────────────────────────
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.redirect(
        "http://localhost:3000/auth/login?error=invalid_token",
      );
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.redirect("http://localhost:3000/auth/login?verified=true");
  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── LOGIN ────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res
        .status(400)
        .json({ message: "Please verify your email first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).json({
      token,
      user: { email: user.email },
      message: "Login successful",
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── FORGOT PASSWORD ──────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email not found" });
    }

    // use separate resetPasswordToken field — never touches verificationToken
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    await user.save();

    // const resetURL = `http://localhost:3000/auth/reset-password/${resetToken}`
    const clientURL = process.env.CLIENT_URL || "http://localhost:3000";
    const resetURL = `${clientURL}/auth/reset-password/${resetToken}`;

    const body = `
      <tr>
        <td align="center" style="color:#555;font-size:14px;padding-bottom:32px;">
          Click the button below to reset your AutoHome password.
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-bottom:16px;">
          <a href="${resetURL}"
            style="display:inline-block;background:#3F8F3A;color:white;padding:12px 32px;border-radius:6px;font-weight:700;text-decoration:none;font-size:15px;">
            Reset Password
          </a>
        </td>
      </tr>
    `;

    await resend.emails.send({
      from: "AutoHome <onboarding@resend.dev>",
      to: email,
      subject: "Reset your AutoHome password",
      html: emailWrapper("Reset your password", body),
    });

    res
      .status(200)
      .json({ message: "Password reset email sent! Please check your inbox." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── RESET PASSWORD ───────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // look up by resetPasswordToken, not verificationToken
    const user = await User.findOne({ resetPasswordToken: token });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = null;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
