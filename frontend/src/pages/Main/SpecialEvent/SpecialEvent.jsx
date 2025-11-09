// import { useState, useEffect } from "react";
// import EventCard from "../../../components/ui/EventCard/EventCard";
// import LoadingError from "../../../components/common/ErrorDisplay/LoadingError";
// import styles from "./SpecialEvent.module.css";
// import { specialEventService } from "../../../services/specialEventService";

// const SpecialEvent = () => {
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const fetchEvents = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const data = await specialEventService.getAllEvents();
//       setEvents(data);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchEvents();
//   }, []);

//   const handleButtonClick = (event) => {
//     alert(`Memproses: ${event.title}`);
//   };

//   if (loading) {
//     return (
//       <div className="container text-center my-5">
//         <div
//           className="spinner-border"
//           role="status"
//           style={{ color: "var(--primary-color)" }}
//         >
//           <span className="visually-hidden">Loading...</span>
//         </div>
//         <p className="mt-2">Loading events...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <LoadingError
//         message={`Gagal memuat event: ${error}`}
//         onRetry={fetchEvents}
//         showHomeLink={true}
//       />
//     );
//   }

//   return (
//     <div>
//       <header className="container text-center my-5">
//         <h1 className="section-title">Special Event</h1>
//         <p className={`lead ${styles.lead}`}>
//           Jadikan momen spesial Anda lebih berkesan dengan paket khusus dari
//           kami
//         </p>
//       </header>

//       <section className="container mb-5">
//         {events.length > 0 ? (
//           <div className="row row-cols-1 row-cols-lg-2 g-4 justify-content-center">
//             {events.map((event) => (
//               <div key={event.event_id} className="col">
//                 <EventCard event={event} onButtonClick={handleButtonClick} />
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="text-center">
//             <p>Tidak ada event yang tersedia saat ini.</p>
//           </div>
//         )}
//       </section>
//     </div>
//   );
// };

// export default SpecialEvent;

import { useState, useEffect } from "react";
import EventCard from "../../../components/ui/EventCard/EventCard";
import LoadingError from "../../../components/common/ErrorDisplay/LoadingError";
import styles from "./SpecialEvent.module.css";
import { specialEventService } from "../../../services/specialEventService";

const SpecialEvent = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await specialEventService.getAllEvents();
      setEvents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleInquireClick = (event) => {
    console.log(`User inquired about event: ${event.title}`);
  };

  if (loading) {
    return (
      <div className="container text-center my-5">
        <div
          className="spinner-border"
          role="status"
          style={{ color: "var(--primary-color)" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <LoadingError
        message={`Gagal memuat event: ${error}`}
        onRetry={fetchEvents}
        showHomeLink={true}
      />
    );
  }

  return (
    <div>
      <header className="container text-center my-5">
        <h1 className="section-title">Special Event</h1>
        <p className={`lead ${styles.lead}`}>
          Jadikan momen spesial Anda lebih berkesan dengan paket khusus dari
          kami
        </p>
      </header>

      <section className="container mb-5">
        {events.length > 0 ? (
          <div className="row row-cols-1 row-cols-lg-2 g-4 justify-content-center">
            {events.map((event) => (
              <div key={event.event_id} className="col">
                <EventCard event={event} onButtonClick={handleInquireClick} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p>Tidak ada event yang tersedia saat ini.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default SpecialEvent;
