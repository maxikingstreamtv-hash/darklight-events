import { managedEvents } from "@/data/event-manager";
import { drivers } from "@/data/drivers";
import { playerTickets, type PlayerTicket } from "@/data/tickets";
import { vehicles } from "@/data/vehicles";

export function getDriverTickets(driverId: string) {
  return playerTickets.filter((ticket) => ticket.driverId === driverId);
}

export function getActiveTicket(driverId: string) {
  return getDriverTickets(driverId).find((ticket) => ticket.status === "active");
}

export function getTicketDetails(ticket: PlayerTicket) {
  return {
    ticket,
    event: managedEvents.find((event) => event.id === ticket.eventId),
    driver: drivers.find((driver) => driver.id === ticket.driverId),
    vehicle: vehicles.find((vehicle) => vehicle.id === ticket.vehicleId),
  };
}

export function getTicketCode(ticket: PlayerTicket) {
  return `${ticket.id}-${ticket.eventId}-${ticket.driverId}`.toUpperCase();
}
