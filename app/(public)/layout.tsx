// app/(public)/layout.tsx

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import {
    MapPin,
    Clock,
    Phone,
    Instagram,
    Facebook,
    MessageCircle,
} from "lucide-react";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <PublicNavbar />
            <main className="flex-1">{children}</main>

            <footer className="bg-gray-900 text-white">
                <div className="container max-w-6xl mx-auto px-4 py-12">
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="font-black text-xl tracking-tight">
                                    Kiki y Lala
                                </span>
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                El espacio de diversión favorito de los ninos en
                                Chiclayo. Juegos, eventos y momentos
                                inolvidables.
                            </p>
                            <div className="flex gap-3 pt-1">
                                <a
                                    href="#"
                                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-brand-azul flex items-center justify-center transition-colors"
                                >
                                    <Facebook className="h-4 w-4" />
                                </a>
                                <a
                                    href="#"
                                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-brand-rosa flex items-center justify-center transition-colors"
                                >
                                    <Instagram className="h-4 w-4" />
                                </a>
                                <a
                                    href="https://wa.me/51999999999"
                                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-green-500 flex items-center justify-center transition-colors"
                                >
                                    <MessageCircle className="h-4 w-4" />
                                </a>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold mb-4 text-white">
                                Servicios
                            </h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                {[
                                    {
                                        href: "/zona-de-juegos",
                                        label: "Zona de Juegos",
                                    },
                                    {
                                        href: "/eventos",
                                        label: "Eventos Privados",
                                    },
                                    { href: "/eventos", label: "Cumpleanos" },
                                    { href: "/eventos", label: "Baby Shower" },
                                    {
                                        href: "/eventos",
                                        label: "Eventos Tematicos",
                                    },
                                ].map(({ href, label }) => (
                                    <li key={label}>
                                        <a
                                            href={href}
                                            className="hover:text-brand-azul transition-colors"
                                        >
                                            {label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold mb-4 text-white">
                                Informacion
                            </h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                {[
                                    { href: "/nosotros", label: "Nosotros" },
                                    {
                                        href: "/nosotros#faq",
                                        label: "Preguntas frecuentes",
                                    },
                                    { href: "/nosotros", label: "Reglamento" },
                                    {
                                        href: "#",
                                        label: "Politicas de privacidad",
                                    },
                                ].map(({ href, label }) => (
                                    <li key={label}>
                                        <a
                                            href={href}
                                            className="hover:text-brand-azul transition-colors"
                                        >
                                            {label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold mb-4 text-white">
                                Contacto
                            </h4>
                            <ul className="space-y-3 text-sm text-gray-400">
                                <li className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-brand-azul" />
                                    <span>
                                        Av. Principal 123, Chiclayo, Peru
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Clock className="h-4 w-4 shrink-0 mt-0.5 text-brand-rosa" />
                                    <span>
                                        Lun–Vie: 10am – 8pm
                                        <br />
                                        Sab–Dom: 9am – 9pm
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Phone className="h-4 w-4 shrink-0 mt-0.5 text-brand-menta" />
                                    <a
                                        href="https://wa.me/51999999999"
                                        className="hover:text-brand-azul transition-colors"
                                    >
                                        +51 999 999 999
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500">
                        <p>
                            &copy; {new Date().getFullYear()} Kiki y Lala
                            &middot; Todos los derechos reservados
                        </p>
                        <p>Hecho con dedicación para las familias del Perú</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
