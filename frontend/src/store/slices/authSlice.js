import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../../services/authService";

export const loginAdmin = createAsyncThunk(
  "auth/loginAdmin",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authService.loginAdmin(email, password);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

export const verifyOTP = createAsyncThunk(
  "auth/verifyOTP",
  async ({ phone, otp }, { rejectWithValue }) => {
    try {
      const response = await authService.verifyOTP(phone, otp);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "OTP verification failed");
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getCurrentUser();

      if (user === null) {
        return rejectWithValue("Token tidak valid atau telah kadaluarsa");
      }

      return user;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to get user");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: authService.getStoredUser(),
    token: authService.getToken(),
    isAuthenticated: authService.isAuthenticated(),
    isLoading: false,
    error: null,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.error = null;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      authService.logout();
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUserProfile: (state, action) => {
      if (state.user) {
        const updatedUser = {
          ...state.user,
          ...action.payload,
          last_login: state.user.last_login,
          is_active:
            state.user.is_active !== undefined ? state.user.is_active : 1,
          role: state.user.role || "pelanggan",
          user_id: state.user.user_id,
          created_at: state.user.created_at,
        };

        state.user = updatedUser;
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;

        const userData = {
          ...action.payload,
          has_password:
            action.payload.has_password !== undefined
              ? action.payload.has_password
              : false,
        };

        state.user = userData;
        state.isAuthenticated = true;
        state.error = null;

        localStorage.setItem("user", JSON.stringify(userData));
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        authService.clearAuthData();
      });
  },
});

export const { setCredentials, logout, clearError, updateUserProfile } =
  authSlice.actions;
export default authSlice.reducer;
