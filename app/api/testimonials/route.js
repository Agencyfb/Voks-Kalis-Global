import { NextResponse } from "next/server";
import connectDb from "@/connectDb/connect";
import Testimonial from "@/models/Testimonial";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDb();
    const testimonials = await Testimonial.find()
      .select("name detail quote rating instagramUrl imageUrl createdAt")
      .sort({ createdAt: -1, _id: -1 })
      .lean();

    return NextResponse.json({
      testimonials: testimonials.map((item) => ({
        id: item._id.toString(),
        name: item.name,
        detail: item.detail,
        quote: item.quote,
        rating: item.rating,
        instagramUrl: item.instagramUrl,
        image: item.imageUrl,
      })),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Public testimonials load failed:", error);
    return NextResponse.json({ error: "Unable to load testimonials." }, { status: 500 });
  }
}
