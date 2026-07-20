import Image from "next/image";

// The real BUBU 30 chrome mark (public/bubu30-logo.png), cropped from the
// master lockup. Swap the file to update it everywhere at once.
export default function Bubu30Logo({ size = "lg" }: { size?: "sm" | "lg" }) {
  const px = size === "lg" ? 280 : 160;
  return (
    <Image
      src="/bubu30-logo.png"
      alt="BUBU 30"
      width={px}
      height={Math.round(px * (640 / 700))}
      priority
      className="mx-auto h-auto select-none"
    />
  );
}
