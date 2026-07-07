export type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

export const faqItems: FAQItem[] = [
  { id: "join-event", question: "Hvordan tilmelder jeg mig et event?", answer: "Find eventet på eventsiden og følg booking- eller tilmeldingsflowet. Staff kan også registrere dig manuelt under EventOS." },
  { id: "login-needed", question: "Skal jeg logge ind?", answer: "Booking kræver login, så DarkLight staff kan se character name og DarkLight ID." },
  { id: "darklight-id", question: "Hvordan får jeg et DarkLight ID?", answer: "Opret en bruger på registreringssiden. Systemet genererer automatisk dit DarkLight ID." },
  { id: "check-in", question: "Hvordan checker jeg ind?", answer: "Mød op til eventet og følg staff-anvisninger. Check-in håndteres manuelt af DarkLight staff." },
  { id: "book-event", question: "Hvordan booker jeg et event?", answer: "Log ind, gå til Booking, udfyld eventtype, dato, tid, lokation og beskrivelse." },
  { id: "sponsor", question: "Hvordan bliver jeg sponsor?", answer: "Kontakt DarkLight staff ingame med en kort RP-aftale om hvad du vil støtte." },
  { id: "crew", question: "Hvordan bliver jeg dommer/eventcrew?", answer: "Kontakt Cole Kane eller Izadora Solis ingame. Staff vurderer behov efter eventtype." },
  { id: "points", question: "Hvordan fungerer point og tider?", answer: "Score-events rangeres på højeste score. Time-events rangeres på laveste sluttid." },
  { id: "hof", question: "Hvordan fungerer Hall of Fame?", answer: "Hall of Fame opdateres først, når staff har godkendt resultater og offentliggjort vindere." },
];

