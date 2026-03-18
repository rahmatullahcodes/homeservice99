import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const REFERRAL_REWARD = (() => {
  const configuredReward = Number(process.env.REFERRAL_JOIN_REWARD);
  if (Number.isFinite(configuredReward) && configuredReward > 0) {
    return configuredReward;
  }
  return 200;
})();

function normalizeReferralCode(value) {
  return String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();
}

function getReferralCodeSeed(user) {
  const nameSeed = String(user?.name || "USER")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 4)
    .padEnd(4, "X");

  return `HS99${nameSeed}${String(user?._id || "").slice(-4).toUpperCase()}`;
}

async function assignReferralCode(user) {
  if (!user) return "";
  if (user.referralCode) return String(user.referralCode);

  const baseCode = getReferralCodeSeed(user);
  let candidate = baseCode;
  let attempts = 0;

  while (attempts < 5) {
    const existing = await User.findOne({
      referralCode: candidate,
      _id: { $ne: user._id }
    }).select("_id");

    if (!existing) {
      user.referralCode = candidate;
      return candidate;
    }

    attempts += 1;
    const suffix = Math.random().toString(36).slice(2, 4).toUpperCase();
    candidate = `${baseCode}${suffix}`;
  }

  user.referralCode = `HS99${String(user._id).slice(-8).toUpperCase()}`;
  return user.referralCode;
}

function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: "user" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

/* SIGNUP */
export async function signup(req, res) {
  try {
    const { name, email, phone, password, referralCode } = req.body;
    const safeName = String(name || "").trim();
    const safeEmail = String(email || "").trim().toLowerCase();
    const safePhone = String(phone || "").trim();
    const normalizedReferralCode = normalizeReferralCode(referralCode);

    if (!safeName || !safeEmail || !password)
      return res.status(400).json({ message: "Missing fields" });

    const exists = await User.findOne({ email: safeEmail });
    if (exists)
      return res.status(400).json({ message: "Email already registered" });

    let referrer = null;
    if (normalizedReferralCode) {
      referrer = await User.findOne({ referralCode: normalizedReferralCode });
      if (!referrer) {
        return res.status(400).json({ message: "Invalid referral code" });
      }
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: safeName,
      email: safeEmail,
      phone: safePhone,
      password: hashed
    });

    await assignReferralCode(user);
    await user.save();

    if (referrer && String(referrer._id) !== String(user._id)) {
      try {
        const referralReward = REFERRAL_REWARD;
        const joinedName = String(user.name || user.email || "Friend").trim();

        if (!Array.isArray(referrer.referrals)) {
          referrer.referrals = [];
        }

        referrer.referrals.push({
          name: joinedName,
          status: "Joined",
          reward: referralReward,
          date: new Date()
        });

        referrer.referralEarnings = Number(referrer.referralEarnings || 0) + referralReward;

        if (referralReward > 0) {
          referrer.walletBalance = Number(referrer.walletBalance || 0) + referralReward;
          if (!Array.isArray(referrer.walletTransactions)) {
            referrer.walletTransactions = [];
          }
          referrer.walletTransactions.push({
            type: "Credit",
            amount: referralReward,
            note: `Referral reward for ${joinedName} signup`,
            source: "Referral",
            status: "Success"
          });
        }

        await referrer.save();
      } catch (referralErr) {
        console.error("Failed to apply referral reward:", referralErr);
      }
    }

    const token = generateToken(user);

    const safeUser = user.toObject();
    delete safeUser.password;

    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/* LOGIN */
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const safeEmail = String(email || "").trim().toLowerCase();

    const user = await User.findOne({ email: safeEmail });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    if (user.blocked) {
      return res.status(403).json({ message: "Account is blocked. Please contact support." });
    }

    const storedPassword = String(user.password || "");
    const isHashedPassword = /^\$2[aby]\$\d{2}\$/.test(storedPassword);

    let match = isHashedPassword
      ? await bcrypt.compare(password, storedPassword)
      : storedPassword === password;

    if (match && !isHashedPassword) {
      user.password = await bcrypt.hash(password, 10);
      await user.save();
    }

    if (!match)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user);
    const safeUser = user.toObject();
    delete safeUser.password;

    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
