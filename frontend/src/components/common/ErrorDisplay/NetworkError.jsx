import ErrorDisplay from "./ErrorDisplay";

const NetworkError = ({ onRetry, showHomeLink }) => {
  return (
    <div className="networkError">
      <ErrorDisplay
        title="Koneksi Terputus"
        message="Tidak dapat terhubung ke server. Pastikan Anda terhubung ke internet dan coba lagi."
        onRetry={onRetry}
        showRetry={true}
        showHomeLink={showHomeLink}
      />
    </div>
  );
};

export default NetworkError;
