import ErrorDisplay from "./ErrorDisplay";

const LoadingError = ({ message, onRetry, showHomeLink }) => {
  return (
    <div className="loadingError">
      <ErrorDisplay
        title="Gagal Memuat Data"
        message={
          message || "Terjadi kesalahan saat memuat data. Silakan coba lagi."
        }
        onRetry={onRetry}
        showRetry={true}
        showHomeLink={showHomeLink}
      />
    </div>
  );
};

export default LoadingError;
