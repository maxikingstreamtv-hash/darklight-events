import { vehicles, type Vehicle } from "@/data/vehicles";

export function getDriverVehicles(driverId: string, vehicleList: Vehicle[] = vehicles) {
  return vehicleList.filter((vehicle) => vehicle.ownerDriverId === driverId);
}

export function getActiveVehicle(driverId: string, vehicleList: Vehicle[] = vehicles) {
  return (
    getDriverVehicles(driverId, vehicleList).find((vehicle) => vehicle.active) ??
    getDriverVehicles(driverId, vehicleList)[0]
  );
}

export function setActiveVehicle(vehicleId: string, vehicleList: Vehicle[] = vehicles) {
  const selectedVehicle = vehicleList.find((vehicle) => vehicle.id === vehicleId);

  if (!selectedVehicle) {
    return vehicleList;
  }

  return vehicleList.map((vehicle) =>
    vehicle.ownerDriverId === selectedVehicle.ownerDriverId
      ? { ...vehicle, active: vehicle.id === vehicleId }
      : vehicle
  );
}

export function getVehicle(id: string, vehicleList: Vehicle[] = vehicles) {
  return vehicleList.find((vehicle) => vehicle.id === id);
}
