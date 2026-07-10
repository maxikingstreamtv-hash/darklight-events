"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/admin/audit";

export type DataResetScope =
  | "leaderboard"
  | "results"
  | "hallOfFame"
  | "season"
  | "achievements"
  | "participants"
  | "checkIns"
  | "sponsors"
  | "permissions"
  | "gallery"
  | "logs"
  | "bookings"
  | "contacts"
  | "all";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

async function requireSuperAdmin() {
  const user = await requireCurrentUser();

  if (user.role !== "SUPER_ADMIN") {
    redirect("/forbidden");
  }

  return user;
}

async function logReset(actorId: string, scope: DataResetScope, count: number) {
  await writeAuditLog({
    actorId,
    action: "data_reset",
    target: `reset:${scope}`,
    details: { module: scope, removedRecords: count },
  });
}

function revalidateResetRoutes() {
  revalidatePath("/competition/admin");
  revalidatePath("/sponsorer");
  revalidatePath("/galleri");
  revalidatePath("/hall-of-fame");
  revalidatePath("/leaderboard");
  revalidatePath("/profile");
  revalidatePath("/events");
}

export async function resetDataAction(scope: DataResetScope, formData: FormData) {
  const actor = await requireSuperAdmin();
  const confirmation = text(formData, "confirmation").toUpperCase();
  const requiredPhrase = scope === "all" ? "NULSTIL ALT EVENT-DATA" : "NULSTIL";

  if (confirmation !== requiredPhrase) {
    redirect(`/competition/admin?resetError=${encodeURIComponent(`Skriv "${requiredPhrase}" for at bekræfte.`)}`);
  }

  let removedRecords = 0;

  if (scope === "sponsors") {
    const result = await prisma.sponsor.deleteMany();
    removedRecords = result.count;
  } else if (scope === "gallery") {
    const result = await prisma.galleryImage.deleteMany();
    removedRecords = result.count;
  } else if (scope === "bookings") {
    const result = await prisma.bookingRequest.deleteMany();
    removedRecords = result.count;
  } else if (scope === "contacts") {
    const result = await prisma.contactMessage.deleteMany();
    removedRecords = result.count;
  } else if (scope === "logs") {
    const result = await prisma.auditLog.deleteMany({
      where: {
        NOT: { actorId: actor.id },
      },
    });
    removedRecords = result.count;
  } else if (scope === "hallOfFame") {
    const result = await prisma.hallOfFame.deleteMany();
    removedRecords = result.count;
  } else if (scope === "leaderboard" || scope === "results" || scope === "season" || scope === "achievements") {
    const result = await prisma.result.deleteMany();
    removedRecords = result.count;
  } else if (scope === "participants" || scope === "checkIns") {
    if (scope === "participants") {
      const result = await prisma.participant.deleteMany();
      removedRecords = result.count;
    } else {
      removedRecords = 0;
    }
  } else if (scope === "permissions") {
    const result = await prisma.eventPermission.deleteMany();
    removedRecords = result.count;
  } else if (scope === "all") {
    const result = await prisma.$transaction(async (tx) => {
      const deletedResults = await tx.result.deleteMany();
      const deletedParticipants = await tx.participant.deleteMany();
      const deletedCompetitions = await tx.competition.deleteMany();
      const deletedHallOfFame = await tx.hallOfFame.deleteMany();
      const deletedEventBookings = await tx.booking.deleteMany();
      const deletedBookingRequests = await tx.bookingRequest.deleteMany();
      const deletedContacts = await tx.contactMessage.deleteMany();
      const deletedGallery = await tx.galleryImage.deleteMany();
      const deletedSponsors = await tx.sponsor.deleteMany();
      const deletedEventPermissions = await tx.eventPermission.deleteMany();
      const deletedEvents = await tx.event.deleteMany();

      return [
        deletedResults.count,
        deletedParticipants.count,
        deletedCompetitions.count,
        deletedHallOfFame.count,
        deletedEventBookings.count,
        deletedBookingRequests.count,
        deletedContacts.count,
        deletedGallery.count,
        deletedSponsors.count,
        deletedEventPermissions.count,
        deletedEvents.count,
      ].reduce((total: number, count: number) => total + count, 0);
    });

    removedRecords = result;
  }

  await logReset(actor.id, scope, removedRecords);
  revalidateResetRoutes();
  redirect(`/competition/admin?resetOk=${encodeURIComponent(`${removedRecords} databaseposter blev nulstillet for ${scope}.`)}`);
}
