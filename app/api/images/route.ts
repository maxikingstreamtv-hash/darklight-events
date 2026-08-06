import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { canAdminManageTarget } from "@/lib/admin/access";
import { prisma } from "@/lib/prisma";
import {
  imageBlobPath,
  type ImageUploadScope,
  validateImageFile,
} from "@/lib/images/image-upload";
import { isBlobStorageConfigured } from "@/lib/events/event-images";

const scopes: ImageUploadScope[] = ["event", "profile", "sponsor", "vehicle", "gallery", "team", "vote"];

export async function POST(request: Request) {
  const actor = await getCurrentUser();
  if (!actor) {
    return NextResponse.json({ error: "Du skal være logget ind for at uploade billeder." }, { status: 401 });
  }
  if (!isBlobStorageConfigured(process.env.BLOB_READ_WRITE_TOKEN)) {
    return NextResponse.json({ error: "Billedlager er ikke konfigureret endnu." }, { status: 503 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const scopeValue = String(formData.get("scope") ?? "");
    const scope = scopes.includes(scopeValue as ImageUploadScope) ? scopeValue as ImageUploadScope : null;
    const requestedOwnerId = String(formData.get("ownerId") ?? "").trim();

    if (!scope) {
      return NextResponse.json({ error: "Ukendt billedtype." }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Vælg et billede." }, { status: 400 });
    }

    let ownerId = requestedOwnerId || "draft";
    if (scope === "profile") {
      ownerId = requestedOwnerId || actor.id;
      if (ownerId !== actor.id) {
        if (!["SUPER_ADMIN", "ADMIN"].includes(actor.role)) {
          return NextResponse.json({ error: "Du må kun ændre dit eget profilbillede." }, { status: 403 });
        }
        if (ownerId !== "draft") {
          const target = await prisma.user.findUnique({ where: { id: ownerId }, select: { role: true } });
          if (!target || !canAdminManageTarget(actor, target.role)) {
            return NextResponse.json({ error: "Du har ikke adgang til at ændre denne bruger." }, { status: 403 });
          }
        }
      }
    } else if (scope === "sponsor") {
      if (!["SUPER_ADMIN", "ADMIN"].includes(actor.role)) {
        return NextResponse.json({ error: "Du har ikke adgang til sponsorlogoer." }, { status: 403 });
      }
    } else if (scope === "team" && actor.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Kun Super Admin kan ændre teambilleder." }, { status: 403 });
    } else if (!["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"].includes(actor.role)) {
      return NextResponse.json({ error: "Du har ikke adgang til at uploade dette billede." }, { status: 403 });
    }

    await validateImageFile(file, scope);
    const pathname = imageBlobPath(scope, ownerId, file.name, randomUUID());
    const blob = await put(pathname, file, { access: "public", addRandomSuffix: false });
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Billedet kunne ikke uploades." },
      { status: 400 },
    );
  }
}
