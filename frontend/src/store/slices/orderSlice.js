import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { orderService } from "../../services/orderService";

export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (params, { rejectWithValue }) => {
    try {
      const response = await orderService.getAllOrders(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch orders"
      );
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  "orders/fetchOrderById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrderById(id);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch order"
      );
    }
  }
);

export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await orderService.createOrder(orderData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create order"
      );
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "orders/updateOrderStatus",
  async ({ id, statusData }, { rejectWithValue }) => {
    try {
      const response = await orderService.updateOrderStatus(id, statusData);
      return { id, ...response };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update order status"
      );
    }
  }
);

export const deleteOrder = createAsyncThunk(
  "orders/deleteOrder",
  async (id, { rejectWithValue }) => {
    try {
      const response = await orderService.deleteOrder(id);
      return { id, ...response };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete order"
      );
    }
  }
);

export const fetchSalesReport = createAsyncThunk(
  "orders/fetchSalesReport",
  async (params, { rejectWithValue }) => {
    try {
      const response = await orderService.getSalesReport(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch sales report"
      );
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    items: [],
    currentOrder: null,
    salesReport: [],
    currentOrderType: "dine_in",
    cart: [],
    orderStatus: "pending",
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    },
    isLoading: false,
    error: null,
  },
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSalesReport: (state) => {
      state.salesReport = [];
    },
    setOrderType: (state, action) => {
      state.currentOrderType = action.payload;
    },
    addToCart: (state, action) => {
      const existingItem = state.cart.find(
        (item) => item.product_id === action.payload.product_id
      );

      if (existingItem) {
        existingItem.quantity += action.payload.quantity || 1;
      } else {
        state.cart.push({
          ...action.payload,
          quantity: action.payload.quantity || 1,
        });
      }
    },
    updateCartItemQuantity: (state, action) => {
      const { product_id, quantity } = action.payload;
      const item = state.cart.find((item) => item.product_id === product_id);

      if (item) {
        if (quantity <= 0) {
          state.cart = state.cart.filter(
            (item) => item.product_id !== product_id
          );
        } else {
          item.quantity = quantity;
        }
      }
    },
    removeFromCart: (state, action) => {
      state.cart = state.cart.filter(
        (item) => item.product_id !== action.payload
      );
    },
    clearCart: (state) => {
      state.cart = [];
    },
    setOrderStatus: (state, action) => {
      state.orderStatus = action.payload;
    },
    clearCurrentOrderData: (state) => {
      state.currentOrderType = "dine_in";
      state.cart = [];
      state.orderStatus = "pending";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.orders;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
        state.error = null;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.cart = [];
        state.orderStatus = "pending";
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.order_id === action.payload.id
        );
        if (index !== -1) {
          state.items[index].status = action.payload.status;
        }
        if (
          state.currentOrder &&
          state.currentOrder.order_id === action.payload.id
        ) {
          state.currentOrder.status = action.payload.status;
        }
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => item.order_id !== action.payload.id
        );
      })
      .addCase(fetchSalesReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSalesReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.salesReport = action.payload;
        state.error = null;
      })
      .addCase(fetchSalesReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearCurrentOrder,
  clearError,
  clearSalesReport,
  setOrderType,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  setOrderStatus,
  clearCurrentOrderData,
} = orderSlice.actions;

export default orderSlice.reducer;
