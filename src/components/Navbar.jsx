import React from "react";
import Logo from "./Logo";
import { Link, useLocation } from "react-router-dom";

function NavBar() {
  const { pathname } = useLocation();

  const NavList = [
    { title: "Home", href: "/" },
    { title: "About", href: "/about" },
    { title: "Developer", href: "/developer" },
    { title: "Portfolio", href: "/portfolio" },
  ];

  const isActive = (href) =>
    href === "/"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  const NavMenu = NavList.map((item) => {
    const active = isActive(item.href);
    const className = [
      "rounded-full px-3 py-2 text-sm font-medium hover:bg-blue-50 hover:text-blue-600",
      active ? "bg-blue-50 text-primary" : "text-slate-700",
    ].join(" ");

    return (
      <Link key={item.href} to={item.href} aria-current={active ? "page" : undefined}>
        <div className={className}>
          <p>{item.title}</p>
        </div>
      </Link>
    );
  });

  return (
    <>
      <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 px-4 py-2 shadow-sm backdrop-blur">
        <div className="container mx-auto flex items-center gap-4 ">
          <Link to="/">
            <Logo />
          </Link>
          <div className="ml-auto flex flex-wrap justify-end gap-1">
            {NavMenu}
          </div>
        </div>
      </div>
    </>
  );
}

export default NavBar;
