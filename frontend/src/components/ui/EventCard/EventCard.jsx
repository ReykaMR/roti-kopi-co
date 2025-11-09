// import styles from "./EventCard.module.css";

// const EventCard = ({ event, onButtonClick }) => {
//   return (
//     <div className={styles.eventCard}>
//       <img src={event.image_url} alt={event.title} className={styles.eventImage} />
//       <div className={styles.eventOverlay}>
//         <h3 className={styles.eventTitle}>{event.title}</h3>
//         <div className={styles.eventPrice}>{event.price}</div>
//         <p className={`mb-4 ${styles.eventDescription}`}>{event.description}</p>
//         {/* <button
//           className={styles.eventButton}
//           onClick={() => onButtonClick(event)}
//         >
//           {event.button_text}
//         </button> */}
//         <a href="https://www.instagram.com/megalaelawati_" className={styles.eventButton} target="_blank">{event.button_text}</a>
//       </div>
//     </div>
//   );
// };

// export default EventCard;

import styles from "./EventCard.module.css";
import { useState, useEffect } from "react";

const EventCard = ({ event, onButtonClick }) => {
  const [whatsappConfig, setWhatsappConfig] = useState({
    phoneNumber: "6283821612483",
    companyName: "Roti & Kopi Co",
  });

  const generateWhatsAppLink = (event) => {
    const { phoneNumber, companyName } = whatsappConfig;

    const message = `Halo ${companyName}!

Saya tertarik dengan paket:
*${event.title}*${event.price ? ` - ${event.price}` : ""}

${event.description ? `Deskripsi: ${event.description}` : ""}

Bisa memberikan informasi lebih detail mengenai:
- Ketersediaan tanggal
- Syarat dan ketentuan
- Customization options

Terima kasih!`;

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  };

  useEffect(() => {
    const config = {
      phoneNumber: import.meta.env.VITE_WHATSAPP_NUMBER || "6283821612483",
      companyName: import.meta.env.VITE_COMPANY_NAME || "Roti & Kopi Co",
    };
    setWhatsappConfig(config);
  }, []);

  return (
    <div className={styles.eventCard}>
      <img
        src={event.image_url}
        alt={event.title}
        className={styles.eventImage}
        onError={(e) => {
          e.target.src = "/default-event-image.jpg";
        }}
      />
      <div className={styles.eventOverlay}>
        <h3 className={styles.eventTitle}>{event.title}</h3>
        {event.price && <div className={styles.eventPrice}>{event.price}</div>}
        <p className={`mb-4 ${styles.eventDescription}`}>{event.description}</p>

        <a
          href={generateWhatsAppLink(event)}
          className={styles.eventButton}
          target="_blank"
          rel="noopener noreferrer"
        >
          {event.button_text || "Inquire Now"}
        </a>
      </div>
    </div>
  );
};

export default EventCard;
