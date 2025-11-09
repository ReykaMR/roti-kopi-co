export const helpers = {
  formatCurrency: (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  },

  formatDate: (date) => {
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  },

  formatDateOnly: (date) => {
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  },

  formatDateForInput: (dateString) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";

      return date.toISOString().split("T")[0];
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  },

  generateRandomString: (length) => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  },

  validateEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  validatePhone: (phone) => {
    const re = /^[0-9]{10,13}$/;
    return re.test(phone);
  },

  getStatusVariant: (status) => {
    switch (status) {
      case "active":
      case "completed":
      case "available":
        return "success";
      case "pending":
        return "warning";
      case "inactive":
      case "cancelled":
      case "unavailable":
        return "danger";
      case "processing":
        return "info";
      default:
        return "secondary";
    }
  },

  getRoleVariant: (role) => {
    switch (role) {
      case "admin":
        return "danger";
      case "kasir":
        return "info";
      case "pelanggan":
        return "success";
      default:
        return "secondary";
    }
  },

  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  truncateText: (text, length) => {
    if (text.length <= length) return text;
    return text.substring(0, length) + "...";
  },

  capitalizeFirst: (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },

  generateOrderNumber: () => {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return `ORD-${timestamp}-${random}`;
  },

  formatDateTime: (date) => {
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  },

  formatTime: (date) => {
    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  },

  calculateDiscount: (originalPrice, discountedPrice) => {
    if (!originalPrice || !discountedPrice) return 0;
    return Math.round(
      ((originalPrice - discountedPrice) / originalPrice) * 100
    );
  },

  formatDiscount: (discountPercent) => {
    return `-${discountPercent}%`;
  },

  isProductOnPromo: (product) => {
    return product.is_promo && product.discount_percent > 0;
  },

  calculateDiscountedPrice: (originalPrice, discountPercent) => {
    if (!originalPrice || !discountPercent) return originalPrice;
    const discountAmount = (originalPrice * discountPercent) / 100;
    return originalPrice - discountAmount;
  },

  isPromoExpired: (validUntil) => {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
  },
};

export default helpers;
