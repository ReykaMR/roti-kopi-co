import ErrorDisplay from "./ErrorDisplay";

const NotFoundError = ({ message, showHomeLink }) => {
  return (
    <div className="notFoundError">
      <ErrorDisplay
        title="Halaman Tidak Ditemukan"
        message={
          message ||
          "Halaman yang Anda cari tidak ditemukan atau mungkin telah dipindahkan."
        }
        showRetry={false}
        showHomeLink={showHomeLink !== false}
      />
    </div>
  );
};

export default NotFoundError;
