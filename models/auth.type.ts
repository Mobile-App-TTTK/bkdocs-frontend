export type LoginRequestBody = {
  email: string;
  password: string;
};

//Request OTP
export type RegisterRequestOtpBody = {
  email: string;
};

// Verify OTP Request
export type VerifyOtpBody = {
  email: string;
  otp: string;
};

// Verify OTP Response
export type VerifyOtpResponse = {
  token: string;
};

//Complete Registration
export type RegisterCompleteBody = {
  name: string;
  email: string;
  password: string;
  token: string; // OTP code từ email
};
