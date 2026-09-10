import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { isScannable: false, error: "No valid image file uploaded" },
        { status: 400 }
      );
    }

    const apiFormData = new FormData();
    apiFormData.append("file", file, "qrcode.png");

    // Server-to-server call to free QR scanning API (No CORS limitations!)
    const externalRes = await fetch("https://api.qrserver.com/v1/read-qr-code/", {
      method: "POST",
      body: apiFormData,
    });

    if (!externalRes.ok) {
      return NextResponse.json({
        isScannable: false,
        error: `Scanning API returned status ${externalRes.status}`,
      });
    }

    const result = await externalRes.json();

    if (Array.isArray(result) && result[0]?.symbol?.[0]) {
      const symbol = result[0].symbol[0];
      if (symbol.data && (symbol.error === null || symbol.error === "" || !symbol.error)) {
        return NextResponse.json({
          isScannable: true,
          decodedData: symbol.data,
          error: null,
        });
      }
      return NextResponse.json({
        isScannable: false,
        decodedData: null,
        error: symbol.error || "QR Code image is unreadable by optical scanners. Please increase contrast or shrink logo size.",
      });
    }

    return NextResponse.json({
      isScannable: false,
      decodedData: null,
      error: "Unexpected response format from scanning API.",
    });
  } catch (err: any) {
    return NextResponse.json({
      isScannable: false,
      decodedData: null,
      error: err?.message || "Internal server error during QR scan",
    });
  }
}
