import Image from "next/image";

export function LogoWatermark() {
  return (
    <div className="watermark" aria-hidden="true">
      <Image
        className="watermark-mark"
        src="/logo-icon-ink.png"
        alt=""
        width={605}
        height={488}
        priority
      />
    </div>
  );
}
