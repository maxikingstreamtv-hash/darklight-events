"use client";

import DriverCareerProfile from "@/components/driver/DriverCareerProfile";
import type { Driver } from "@/data/drivers";

export default function DriverProfile({ driver }: { driver: Driver }) {
  return <DriverCareerProfile driver={driver} adminMode />;
}
