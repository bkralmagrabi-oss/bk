import Image from "next/image";

type LogoVariant = "full" | "icon";
type LogoTheme = "ink" | "white";

const SOURCES: Record<string, { src: string; width: number; height: number }> = {
  "full-ink": { src: "/logo-lockup-ink.png", width: 747, height: 594 },
  "full-white": { src: "/logo-lockup-white.png", width: 747, height: 594 },
  "icon-ink": { src: "/logo-icon-ink.png", width: 605, height: 488 },
  "icon-white": { src: "/logo-icon-white.png", width: 605, height: 488 },
};

export function Logo({
  variant = "full",
  theme = "ink",
}: {
  variant?: LogoVariant;
  theme?: LogoTheme;
}) {
  const { src, width, height } = SOURCES[`${variant}-${theme}`];

  return (
    <a href="#top" className={`logo logo-${variant}`} aria-label="BK Web Design — home">
      <Image
        className="logo-img"
        src={src}
        alt="BK Web Design"
        width={width}
        height={height}
        priority
      />
    </a>
  );
}
