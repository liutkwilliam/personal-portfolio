import { Link, Outlet, useLocation } from 'react-router-dom'
import { signOut } from 'firebase/auth';
import Logo from "../components/Logo";
import Button from '../components/Button';
import { auth } from '../config/firebase';

export default function AdminLayout() {
    const { pathname } = useLocation();

    const AdminNavList = [
        { title: "View Site", href: "/" },
    ];

    const isActive = (href) =>
        href === "/admin"
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);

    const AdminNavMenu = AdminNavList.map((item) => {
        const active = isActive(item.href);
        const className = [
            "rounded-full px-3 py-2 text-sm font-medium hover:bg-blue-50 hover:text-primary",
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
    
    const handleLogout = async () => {
        await signOut(auth);
    };

    return (
        <>
            <div className="sticky top-0 z-50 flex items-center gap-4 border-b border-slate-200 bg-white/80 px-4 py-2 shadow-sm backdrop-blur">
                <div className="flex gap-4 items-center">
                    <Link to="/admin">
                        <Logo />
                    </Link>
                    <p className="font-semi-bold">Admin Dashboard</p>
                </div>

                <div className="ml-auto flex flex-wrap justify-end gap-1">
                    {AdminNavMenu}
                    <Button type="button" onClick={handleLogout} variant="ghost" className="rounded-full shadow-none">
                        Logout
                    </Button>
                </div>
            </div>
            <div className="p-4 bg-gray-100">
                <Outlet />
            </div>
        </>
    )
}
