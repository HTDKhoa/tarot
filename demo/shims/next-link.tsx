import type { AnchorHTMLAttributes, ReactNode } from "react";

/** Bản demo một trang: liên kết sang trang khác chỉ hiện thông báo, không điều hướng. */
export default function Link({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children?: ReactNode }) {
  return (
    <a
      {...rest}
      href="#"
      onClick={(e) => {
        e.preventDefault();
        (window as unknown as { __demoNav?: (h: string) => void }).__demoNav?.(href);
      }}
    >
      {children}
    </a>
  );
}
