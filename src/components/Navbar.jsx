import { useCallback, useState } from "react";
import { BsChevronDown } from "react-icons/bs";
import Logo from "./Logo";
import { Link, useLocation } from "react-router-dom";


const Menu = () => {
  const { pathname } = useLocation();

  const NavList = [
    { title: "Home", href: "/" },
    { title: "About", href: "/about" },
    { title: "Developer Portfolio", href: "/developer" },
    { title: "Design Portflio", href: "/portfolio" },
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
      {NavMenu}
    </>
  )
}

const DesktopMenu = () => {
  return (
    <div className="hidden md:flex flex-row gap-2">
      <Menu />
    </div>
  )
}

const MobileMenu = ({ visible }) => {
  if (!visible) {
    return null;
  } else {
    return (
      <div className="absolute top-8 right-0 px-3 py-4 lg:hidden bg-background rounded-full">
        <Menu />
      </div>
    );
  }
}


const NavBar = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const toggleMobileMenu = useCallback(() => {
    setShowMobileMenu((current) => !current);
  }, []);
  return (
    <>
      <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 px-4 py-2 shadow-sm backdrop-blur select-none">
        <div className="container mx-auto flex items-center gap-4 ">
          <Link to="/">
            <Logo />
          </Link>
          <div className="ml-auto flex flex-wrap justify-end gap-1">
            <DesktopMenu />
            <div
              onClick={toggleMobileMenu}
              className="md:hidden flex flex-row items-center gap-2 ml-8 cursor-pointer relative text-foreground text-sm font-bold"
            >
              <p
                className={`transition ${showMobileMenu ? "font-bold text-primary" : ""}`}
              >
                Menu
              </p>
              <BsChevronDown
                className={`transition ${showMobileMenu ? "rotate-180 text-primary" : "rotate-0"}`}
              />
              <MobileMenu visible={showMobileMenu} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default NavBar;
