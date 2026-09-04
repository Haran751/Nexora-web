const fs = require('fs');

// 1. vite.config.js
let vite = fs.readFileSync('vite.config.js', 'utf8');
vite = vite.replace(/if \(!gmailUser \|\| !gmailPass\) \{[\s\S]*?return;\n\s*\}/, `if (!gmailUser || !gmailPass) {
            console.error("SMTP Credentials missing.");
            res.statusCode = 500;
            res.end(JSON.stringify({ error: "Server tidak dikonfigurasi untuk mengirim email." }));
            return;
          }`);
vite = vite.replace(/if \(!supabaseUrl \|\| !serviceKey\) \{[\s\S]*?return;\n\s*\}/, `if (!supabaseUrl || !serviceKey) {
            console.error("Supabase Credentials missing.");
            res.statusCode = 500;
            res.end(JSON.stringify({ error: "Server tidak dikonfigurasi untuk update password." }));
            return;
          }`);
fs.writeFileSync('vite.config.js', vite);

// 2. AuthContext.jsx
let auth = fs.readFileSync('src/context/AuthContext.jsx', 'utf8');
auth = auth.replace(/const DEMO_USER_KEY = "nexora_demo_user_v1";\n/g, '');
auth = auth.replace(/demoCode: sendRes\?\.demo \? code : null/g, 'demoCode: null');
auth = auth.replace(/return \{ success: true, demoCode: sendRes\?\.demo \? code : null \};/g, 'return { success: true, demoCode: null };');
auth = auth.replace(/localStorage\.setItem\(DEMO_USER_KEY,.*?\);/g, '');
auth = auth.replace(/localStorage\.removeItem\(DEMO_USER_KEY\);/g, '');
auth = auth.replace(/if \(!isSupabaseConfigured\) \{[\s\S]*?return \{ success: true, demo: true \};\n\s*\}/g, `if (!isSupabaseConfigured) {
        throw new Error("Supabase is not configured.");
      }`);
auth = auth.replace(/} else \{\n\s*const mockUser = \{[\s\S]*?return \{ user: mockUser \};\n\s*\}/g, `} else {
      throw new Error("Supabase is not configured.");
    }`);
auth = auth.replace(/\} else if \(user\) \{\n\s*localStorage\.setItem\(DEMO_USER_KEY, JSON\.stringify\(\{ user, profile: next \}\)\);\n\s*\}/g, '}');

// For signUp verifyOtp:
auth = auth.replace(/if \(isSupabaseConfigured\) \{([\s\S]*?)\n\s*\}\n\s*setUser\(targetUser\);\n\s*setProfile\(newProfile\);\n\s*saveProfile\(newProfile\);\n\s*localStorage\.setItem\(DEMO_USER_KEY,.*?\);\n\s*sessionStorage\.removeItem\("nexora_pending_signup"\);\n\s*return \{ user: targetUser \};/g, `if (isSupabaseConfigured) {
        $1
        sessionStorage.removeItem("nexora_pending_signup");
        return { user: targetUser };
      } else {
        throw new Error("Supabase is not configured.");
      }`);

fs.writeFileSync('src/context/AuthContext.jsx', auth);

// 3. OtpInput.jsx
let otp = fs.readFileSync('src/components/OtpInput.jsx', 'utf8');
otp = otp.replace(/demoCode = "",/g, '');
otp = otp.replace(/const handleAutofillDemo = \(\) => \{[\s\S]*?\};\n/g, '');
otp = otp.replace(/\{demoCode && \([\s\S]*?\)\}  /g, '');
fs.writeFileSync('src/components/OtpInput.jsx', otp);

// 4. jobsService.js & applicationsService.js
let jobs = fs.readFileSync('src/services/jobsService.js', 'utf8');
jobs = jobs.replace(/\|\| "demo-employer"/g, '');
fs.writeFileSync('src/services/jobsService.js', jobs);

let apps = fs.readFileSync('src/services/applicationsService.js', 'utf8');
apps = apps.replace(/if \(id\.startsWith\("demo-app-"\)\) return false;\n\s*/g, '');
fs.writeFileSync('src/services/applicationsService.js', apps);

// 5. SignUpPage.jsx & ForgotPasswordPage.jsx
let signup = fs.readFileSync('src/pages/SignUpPage.jsx', 'utf8');
signup = signup.replace(/const \[demoCode, setDemoCode\] = useState\(""\);\n/g, '');
signup = signup.replace(/if \(res\?\.demoCode\) setDemoCode\(res\.demoCode\);\n/g, '');
signup = signup.replace(/demoCode=\{demoCode\}\n/g, '');
fs.writeFileSync('src/pages/SignUpPage.jsx', signup);

let forgot = fs.readFileSync('src/pages/ForgotPasswordPage.jsx', 'utf8');
forgot = forgot.replace(/const \[demoCode, setDemoCode\] = useState\(""\);\n/g, '');
forgot = forgot.replace(/if \(res\?\.demoCode\) setDemoCode\(res\.demoCode\);\n/g, '');
forgot = forgot.replace(/demoCode=\{demoCode\}\n/g, '');
fs.writeFileSync('src/pages/ForgotPasswordPage.jsx', forgot);
