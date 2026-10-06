import { ICONS, MARK, type Svg } from "../brand/assets";
import type { IconName } from "../engine";

/** Hand-drawn doodle icon (brand/icons), coloured with currentColor. */
export function Icon({ name, className = "svg-i" }: { name: IconName; className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS[name] }} />;
}

/** Inline brand SVG (doodle illustration, note arrow). */
export function BrandSvg({ svg, className, label, style }: { svg: Svg; className?: string; label?: string; style?: React.CSSProperties }) {
  return (
    <svg
      className={className}
      viewBox={svg.viewBox}
      style={style}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
      dangerouslySetInnerHTML={{ __html: svg.body }}
    />
  );
}

/** Sketch B logo mark. Each use needs its own clip id. `wipe` wraps the hatching for the splash colour-in. */
export function Mark({ id, size, wipe, className }: { id: string; size?: number; wipe?: boolean; className?: string }) {
  let body = MARK.body.replace(/id="d"/g, `id="${id}"`).replace(/url\(#d\)/g, `url(#${id})`);
  if (wipe) body = body.replace(/(<g class="sk-hatch"[\s\S]*?<\/g>)/, '<g class="sk-wipe">$1</g>');
  return <svg className={className} width={size} height={size} viewBox={MARK.viewBox} aria-hidden="true" dangerouslySetInnerHTML={{ __html: body }} />;
}

/** Wordmark: "Bajet" lime/100 + "Je" lime/300 */
export function Wordmark({ size = 17 }: { size?: number }) {
  return (
    <span style={{ fontSize: size, fontWeight: 600, letterSpacing: "-.02em", color: "var(--color-lime-100)" }}>
      Bajet<span style={{ color: "var(--lime)" }}>Je</span>
    </span>
  );
}
