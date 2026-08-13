console.log("=== TESTING INDIAN PHONE NUMBER VALIDATION ===");

const testCases = [
  { input: "9876543210", expectedValid: true },
  { input: "+91 9876543210", expectedValid: true },
  { input: "+91-9876543210", expectedValid: true },
  { input: "09876543210", expectedValid: true },
  { input: "6361234567", expectedValid: true },
  { input: "5432167890", expectedValid: false }, // doesn't start with 6-9
  { input: "123456", expectedValid: false }, // too short
  { input: "98765432101234", expectedValid: false }, // too long
  { input: "98765abcde", expectedValid: false }, // letters
];

testCases.forEach((tc, idx) => {
  const cleaned = tc.input.trim().replace(/[\s\-\(\)]/g, "");
  let isValid = true;
  let normalized = null;

  if (/[^\d+]/.test(cleaned)) {
    isValid = false;
  } else {
    let digits = cleaned;
    if (cleaned.startsWith("+91")) digits = cleaned.slice(3);
    else if (cleaned.startsWith("91") && cleaned.length === 12) digits = cleaned.slice(2);
    else if (cleaned.startsWith("0") && cleaned.length === 11) digits = cleaned.slice(1);

    if (!/^[6-9]\d{9}$/.test(digits)) isValid = false;
    else normalized = `+91${digits}`;
  }

  console.log(`Test ${idx + 1}: "${tc.input}" -> Valid: ${isValid} (${normalized || 'Invalid'}), Expected: ${tc.expectedValid}`);
});
