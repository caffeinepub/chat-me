import { useState } from "react";
import type { PublicUser } from "../backend.d";
import { getActor } from "../lib/actor";

interface LoginScreenProps {
  onLogin: (token: string, user: PublicUser) => void;
}

type Step = "phone" | "otp" | "register-info";

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [step, setStep] = useState<Step>("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [pendingOtp, setPendingOtp] = useState(""); // demo mode: OTP shown on screen
  const [localDemoOtp, setLocalDemoOtp] = useState(""); // local fallback OTP for offline verification
  const [isNewUser, setIsNewUser] = useState(false);
  const [verifiedOtp, setVerifiedOtp] = useState("");

  const [regName, setRegName] = useState("");
  const [regPin, setRegPin] = useState("");
  const [regPinConfirm, setRegPinConfirm] = useState("");

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.7)",
    border: "1.5px solid #FFD1DC",
    borderRadius: "50px",
    padding: "12px 20px",
    fontSize: "15px",
    color: "#1E1E1E",
    outline: "none",
    width: "100%",
    fontFamily: "'Quicksand', sans-serif",
    backdropFilter: "blur(8px)",
    boxSizing: "border-box" as const,
  };

  const handleSendOtp = async () => {
    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      setError("Please enter your phone number 📱");
      return;
    }
    if (cleanPhone.replace(/\D/g, "").length < 8) {
      setError("Please enter a valid phone number 📱");
      return;
    }
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const actor = await getActor();
      const result = await actor.requestOtp(cleanPhone);
      if ("ok" in result) {
        // If result.ok is non-empty, SMS not configured -- show demo OTP
        setPendingOtp(result.ok);
        setLocalDemoOtp(""); // backend handled it
        const registered = await actor.isPhoneRegistered(cleanPhone);
        setIsNewUser(!registered);
        setStep("otp");
        if (result.ok) {
          setSuccessMsg("OTP ready — enter the code shown below 📲");
        } else {
          setSuccessMsg(`OTP sent to ${cleanPhone} 📱`);
        }
      } else {
        // Backend returned an error variant — show the actual message
        setError(result.err || "Could not send OTP. Please try again 💔");
      }
    } catch {
      // Canister unreachable — fallback to pure local demo mode, assume new user
      const localOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setPendingOtp(localOtp);
      setLocalDemoOtp(localOtp);
      setIsNewUser(true); // default to registration flow
      setStep("otp");
      setSuccessMsg("Could not reach server — use the code shown below 📲");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setError("Please enter the 6-digit OTP 🔢");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // If we have a local demo OTP, verify it client-side
      if (localDemoOtp) {
        if (cleanOtp !== localDemoOtp) {
          setError("Wrong OTP! Please check and try again ❌");
          setLoading(false);
          return;
        }
        setVerifiedOtp(cleanOtp);
        // Always proceed to register-info in local demo mode
        setStep("register-info");
        setLoading(false);
        return;
      }

      const actor = await getActor();
      if (isNewUser) {
        const valid = await actor.verifyOtp(phone.trim(), cleanOtp);
        if (valid) {
          setVerifiedOtp(cleanOtp);
          setStep("register-info");
          setError("");
        } else {
          setError("Wrong OTP! Please check and try again ❌");
        }
      } else {
        const result = await actor.loginWithOtp(phone.trim(), cleanOtp);
        if ("ok" in result) {
          onLogin(result.ok.token, result.ok.user);
        } else {
          setError(`${result.err} ❌`);
        }
      }
    } catch {
      // If backend unreachable but we have a localDemoOtp and user entered correct code — let them in
      if (localDemoOtp && otp.trim() === localDemoOtp) {
        const demoUser: PublicUser = {
          id: BigInt(1),
          name: "Demo User",
          about: "Demo account 🌸",
          avatarUrl: "",
          phone: phone.trim(),
          joinedAt: BigInt(Date.now()),
          isAdmin: false,
        };
        onLogin(`demo-token-${phone.trim()}`, demoUser);
      } else {
        setError(
          "Verification failed. Please check your connection and try again 📡",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!regName.trim()) {
      setError("Please enter your name ✨");
      return;
    }
    if (regPin.length < 4) {
      setError("PIN must be at least 4 digits 🔑");
      return;
    }
    if (regPin !== regPinConfirm) {
      setError("PINs do not match 💕");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const actor = await getActor();

      // In local demo mode — try backend first, but if it fails, create a local mock user
      if (localDemoOtp) {
        let loggedIn = false;
        try {
          let otpForReg = verifiedOtp;
          try {
            const otpResult = await actor.requestOtp(phone.trim());
            if ("ok" in otpResult) {
              otpForReg = otpResult.ok || verifiedOtp;
            }
          } catch {
            // ignore
          }
          const result = await actor.registerWithOtp(
            phone.trim(),
            otpForReg,
            regName.trim(),
            regPin.trim(),
          );
          if ("ok" in result) {
            const token = result.ok.token;
            const profileResult = await actor.getMyProfile(token);
            if (profileResult && profileResult.length > 0) {
              onLogin(token, profileResult[0] as PublicUser);
              loggedIn = true;
            }
          }
        } catch {
          // backend unreachable — fall through to local demo login
        }
        if (!loggedIn) {
          // Create a local demo user so the app can be explored without backend
          const demoUser: PublicUser = {
            id: BigInt(1),
            name: regName.trim() || "Demo User",
            about: "Demo account 🌸",
            avatarUrl: "",
            phone: phone.trim(),
            joinedAt: BigInt(Date.now()),
            isAdmin: false,
          };
          onLogin(`demo-token-${phone.trim()}`, demoUser);
          loggedIn = true;
        }
        return;
      }

      // Normal flow
      const otpResult = await actor.requestOtp(phone.trim());
      if (!("ok" in otpResult)) {
        setError(otpResult.err || "Could not generate OTP. Please try again.");
        setLoading(false);
        return;
      }
      const freshOtp = otpResult.ok || verifiedOtp;
      const result = await actor.registerWithOtp(
        phone.trim(),
        freshOtp,
        regName.trim(),
        regPin.trim(),
      );
      if ("ok" in result) {
        const token = result.ok.token;
        const profileResult = await actor.getMyProfile(token);
        if (profileResult && profileResult.length > 0) {
          onLogin(token, profileResult[0] as PublicUser);
        } else {
          setStep("phone");
          setSuccessMsg("Account created! Please login 🌸");
        }
      } else {
        setError(`${result.err} ❌`);
      }
    } catch {
      setError(
        "Registration failed. Please check your connection and try again 📡",
      );
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setStep("phone");
    setPhone("");
    setOtp("");
    setPendingOtp("");
    setLocalDemoOtp("");
    setVerifiedOtp("");
    setError("");
    setSuccessMsg("");
    setRegName("");
    setRegPin("");
    setRegPinConfirm("");
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{
        background:
          "linear-gradient(135deg, #FFF0F5 0%, #EDE8FF 50%, #FFE8F5 100%)",
        fontFamily: "'Quicksand', sans-serif",
      }}
    >
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 0 }}
      >
        {["💕", "✨", "🌸", "⭐", "💫", "🎀", "💗", "🌟", "🦋", "🍓"].map(
          (e, i) => (
            <span
              key={e}
              className="absolute text-3xl"
              style={{
                opacity: 0.12,
                left: `${5 + ((i * 19) % 90)}%`,
                top: `${3 + ((i * 27) % 90)}%`,
              }}
            >
              {e}
            </span>
          ),
        )}
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center"
            style={{ boxShadow: "0 0 30px #FF8C9F66" }}
          >
            <img
              src="/assets/uploads/3fa58a27358a3cd2a338ec3578d3e777-019d2f05-0cec-72ee-b9a7-7b6fb53d74d6-1.jpg"
              alt="Chat Me Logo"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold" style={{ color: "#FF8C9F" }}>
              Chat Me 💬
            </h1>
            <p className="text-sm mt-1" style={{ color: "#7A6E6E" }}>
              Cute chats, always 🌸
            </p>
          </div>
        </div>

        {/* Card */}
        <div
          className="w-full rounded-3xl p-6 flex flex-col gap-5"
          style={{
            background: "rgba(255,250,245,0.9)",
            backdropFilter: "blur(20px)",
            border: "1.5px solid #FFD1DC",
            boxShadow: "0 8px 40px rgba(255,140,159,0.15)",
          }}
        >
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2">
            {(["phone", "otp", "register-info"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background:
                      step === s
                        ? "#FF8C9F"
                        : i < ["phone", "otp", "register-info"].indexOf(step)
                          ? "#FFB6C8"
                          : "#FFE4EC",
                    color: step === s ? "#fff" : "#FF8C9F",
                  }}
                >
                  {i + 1}
                </div>
                {i < 2 && (
                  <div
                    style={{
                      width: 20,
                      height: 2,
                      background: "#FFD1DC",
                      borderRadius: 2,
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {error && (
            <div
              className="px-4 py-3 rounded-2xl text-sm font-semibold text-center"
              style={{ background: "#FFD1DC", color: "#C0304A" }}
              data-ocid="login.error_state"
            >
              {error}
            </div>
          )}
          {successMsg && (
            <div
              className="px-4 py-3 rounded-2xl text-sm font-semibold text-center"
              style={{ background: "#E8FFE8", color: "#2E8B57" }}
              data-ocid="login.success_state"
            >
              {successMsg}
            </div>
          )}

          {/* STEP 1: Enter Phone */}
          {step === "phone" && (
            <div className="flex flex-col gap-4">
              <div className="text-center">
                <p className="font-bold text-base" style={{ color: "#FF8C9F" }}>
                  📱 Enter your phone number
                </p>
                <p className="text-xs mt-1" style={{ color: "#7A6E6E" }}>
                  We'll send you a verification code via SMS
                </p>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                style={inputStyle}
                onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                data-ocid="login.input"
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full py-3 rounded-full text-white font-bold text-sm transition-all hover:opacity-85"
                style={{ background: loading ? "#FFB6C8" : "#FF8C9F" }}
                data-ocid="login.primary_button"
              >
                {loading ? "✿ Sending OTP..." : "Send OTP via SMS 📨"}
              </button>
            </div>
          )}

          {/* STEP 2: Enter OTP */}
          {step === "otp" && (
            <div className="flex flex-col gap-4">
              <div className="text-center">
                <p className="font-bold text-base" style={{ color: "#FF8C9F" }}>
                  🔢 Enter OTP
                </p>
                <p className="text-xs mt-1" style={{ color: "#7A6E6E" }}>
                  Sent to {phone}
                </p>
              </div>

              {/* Show OTP when SMS could not be delivered */}
              {pendingOtp && (
                <div
                  className="rounded-2xl p-4 text-center"
                  style={{
                    background: "linear-gradient(135deg, #FFF9E6, #FFF3D0)",
                    border: "1.5px dashed #FFB347",
                  }}
                >
                  <p
                    className="text-xs font-semibold"
                    style={{ color: "#B8860B" }}
                  >
                    ⚠️ SMS could not be delivered
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#7A6E6E" }}>
                    Your OTP code is:
                  </p>
                  <p
                    className="text-3xl font-bold tracking-[0.3em] mt-1"
                    style={{ color: "#FF8C9F", fontFamily: "monospace" }}
                  >
                    {pendingOtp}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="Enter 6-digit OTP"
                  style={{
                    ...inputStyle,
                    textAlign: "center",
                    letterSpacing: "0.3em",
                    fontSize: "20px",
                    fontWeight: "bold",
                  }}
                  maxLength={6}
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                  data-ocid="login.input"
                />
              </div>

              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
                className="w-full py-3 rounded-full text-white font-bold text-sm transition-all hover:opacity-85"
                style={{
                  background:
                    loading || otp.length !== 6 ? "#FFB6C8" : "#FF8C9F",
                }}
                data-ocid="login.primary_button"
              >
                {loading
                  ? "✿ Verifying..."
                  : isNewUser
                    ? "Verify & Continue 🌸"
                    : "Verify & Login 💕"}
              </button>

              <button
                type="button"
                onClick={resetFlow}
                className="text-xs text-center underline"
                style={{
                  color: "#FF8C9F",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
                data-ocid="login.cancel_button"
              >
                ← Change phone number
              </button>
            </div>
          )}

          {/* STEP 3: Register Info */}
          {step === "register-info" && (
            <div className="flex flex-col gap-4">
              <div className="text-center">
                <p className="font-bold text-base" style={{ color: "#FF8C9F" }}>
                  ✨ Create your account
                </p>
                <p className="text-xs mt-1" style={{ color: "#7A6E6E" }}>
                  Just a few more details 🌸
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <span
                  className="text-xs font-bold px-2"
                  style={{ color: "#FF8C9F" }}
                >
                  ✨ Your Name
                </span>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Lily 🌸"
                  style={inputStyle}
                  data-ocid="login.input"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span
                  className="text-xs font-bold px-2"
                  style={{ color: "#FF8C9F" }}
                >
                  🔑 Create PIN (4-6 digits)
                </span>
                <input
                  type="password"
                  inputMode="numeric"
                  value={regPin}
                  onChange={(e) =>
                    setRegPin(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="e.g. 1234"
                  style={inputStyle}
                  maxLength={6}
                  data-ocid="login.input"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span
                  className="text-xs font-bold px-2"
                  style={{ color: "#FF8C9F" }}
                >
                  🔑 Confirm PIN
                </span>
                <input
                  type="password"
                  inputMode="numeric"
                  value={regPinConfirm}
                  onChange={(e) =>
                    setRegPinConfirm(
                      e.target.value.replace(/\D/g, "").slice(0, 6),
                    )
                  }
                  placeholder="Re-enter PIN"
                  style={inputStyle}
                  maxLength={6}
                  onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                  data-ocid="login.input"
                />
              </div>

              <button
                type="button"
                onClick={handleRegister}
                disabled={loading}
                className="w-full py-3 rounded-full text-white font-bold text-sm transition-all hover:opacity-85"
                style={{ background: loading ? "#FFB6C8" : "#FF8C9F" }}
                data-ocid="login.submit_button"
              >
                {loading ? "✿ Creating account..." : "Join Chat Me 🎀"}
              </button>

              <button
                type="button"
                onClick={resetFlow}
                className="text-xs text-center underline"
                style={{
                  color: "#FF8C9F",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
                data-ocid="login.cancel_button"
              >
                ← Start over
              </button>
            </div>
          )}
        </div>

        <p className="text-xs text-center" style={{ color: "#7A6E6E" }}>
          Your phone number is your unique ID 💕
        </p>
      </div>
    </div>
  );
}
