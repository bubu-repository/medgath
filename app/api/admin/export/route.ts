import ExcelJS from "exceljs";
import QRCode from "qrcode";
import { isAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-server";
import type { EventType, Guest } from "@/lib/types";

// exceljs and qrcode both need Node APIs (Buffer, zlib), so this route can
// not run on the edge runtime.
export const runtime = "nodejs";

const EVENT_LABEL: Record<EventType, string> = {
  media: "Media Gathering",
  bubu30: "30th Anniversary",
};

// QR is rendered at 2x the cell size so it stays sharp when the sheet is
// printed or zoomed; the image is then placed at QR_CELL_PX.
const QR_PX = 220;
const QR_CELL_PX = 96;

// Excel sizes rows in points and columns in character widths.
const PX_PER_POINT = 4 / 3;
const PX_PER_CHAR = 7;

function fmt(iso: string | null, timeZone: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  });
}

export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const url = new URL(request.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const event = url.searchParams.get("event");
  // The client sends its own IANA zone so "14 Aug" in the sheet means 14 Aug
  // where the organiser is, not UTC.
  const tz = url.searchParams.get("tz") || "UTC";

  const db = supabaseAdmin();
  let query = db.from("guests").select("*").order("created_at", {
    ascending: true,
  });

  if (event === "media" || event === "bubu30") query = query.eq("event_type", event);
  // from/to arrive as absolute instants already resolved from the picker's
  // local dates, so the range is a plain half-open interval here.
  if (from) query = query.gte("created_at", from);
  if (to) query = query.lt("created_at", to);

  const { data, error } = await query;

  if (error) {
    console.error("Export query failed:", error);
    return Response.json({ error: "Could not load guests." }, { status: 500 });
  }

  const guests = (data ?? []) as Guest[];

  const wb = new ExcelJS.Workbook();
  wb.creator = "BUBU 30";
  const ws = wb.addWorksheet("Guest list", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  ws.columns = [
    { header: "No", key: "no", width: 5 },
    { header: "QR", key: "qr", width: QR_CELL_PX / PX_PER_CHAR },
    { header: "Ticket code", key: "code", width: 14 },
    { header: "Name", key: "name", width: 26 },
    { header: "Email", key: "email", width: 30 },
    { header: "Phone", key: "phone", width: 18 },
    { header: "Event", key: "event", width: 18 },
    { header: "Pax", key: "pax", width: 6 },
    { header: "Registered", key: "registered", width: 20 },
    { header: "Checked in", key: "checkedIn", width: 20 },
    { header: "Company / LinkedIn", key: "company", width: 34 },
    { header: "Bubu era", key: "era", width: 16 },
    { header: "Contribution", key: "contribution", width: 34 },
  ];

  const header = ws.getRow(1);
  header.font = { bold: true, color: { argb: "FF111111" } };
  header.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFF5900" },
  };
  header.alignment = { vertical: "middle" };
  header.height = 22;

  // Generating every QR up front keeps the row loop synchronous and avoids
  // opening one encode per row inside the writer. base64 rather than a
  // Buffer: qrcode and exceljs disagree on the Buffer type, and addImage
  // takes base64 directly.
  const qrCodes = await Promise.all(
    guests.map(async (g) => {
      const dataUrl = await QRCode.toDataURL(g.ticket_hash, {
        width: QR_PX,
        margin: 1,
        errorCorrectionLevel: "M",
      });
      return dataUrl.replace(/^data:image\/png;base64,/, "");
    })
  );

  guests.forEach((g, i) => {
    const row = ws.addRow({
      no: i + 1,
      qr: "",
      code: g.ticket_hash,
      name: g.name,
      email: g.email,
      phone: g.phone,
      event: EVENT_LABEL[g.event_type] ?? g.event_type,
      pax: g.guest_count || 1,
      registered: fmt(g.created_at, tz),
      checkedIn: g.check_in_status ? fmt(g.checked_in_at, tz) : "Not yet",
      company: g.company ?? "",
      era: g.bubu_period ?? "",
      contribution: g.contribution ?? "",
    });

    row.height = QR_CELL_PX / PX_PER_POINT;
    row.alignment = { vertical: "middle", wrapText: true };
    row.getCell("code").font = { name: "Consolas", bold: true, size: 12 };
    row.getCell("pax").alignment = { vertical: "middle", horizontal: "center" };

    const imageId = wb.addImage({ base64: qrCodes[i], extension: "png" });
    // Inset by 2px so the QR does not touch the cell borders.
    ws.addImage(imageId, {
      tl: { col: 1.06, row: row.number - 1 + 0.06 },
      ext: { width: QR_CELL_PX - 8, height: QR_CELL_PX - 8 },
    });
  });

  ws.autoFilter = { from: "A1", to: { row: 1, column: ws.columnCount } };

  const buffer = await wb.xlsx.writeBuffer();

  const stamp = new Date().toISOString().slice(0, 10);
  const scope =
    event === "media" || event === "bubu30" ? `-${event}` : "-all-events";
  const filename = `bubu30-guestlist${scope}-${stamp}.xlsx`;

  return new Response(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
      "X-Guest-Count": String(guests.length),
    },
  });
}
