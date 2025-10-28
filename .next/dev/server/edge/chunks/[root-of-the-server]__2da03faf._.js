(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__2da03faf._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/proyectos/nopain/utils/supabase/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$proyectos$2f$nopain$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/proyectos/nopain/node_modules/@supabase/ssr/dist/module/index.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$proyectos$2f$nopain$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/proyectos/nopain/node_modules/@supabase/ssr/dist/module/createServerClient.js [middleware-edge] (ecmascript)");
;
function createClient(req, res) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$proyectos$2f$nopain$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["createServerClient"])(("TURBOPACK compile-time value", "https://vzjetdgvkwpaobgvptug.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6amV0ZGd2a3dwYW9iZ3ZwdHVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNDEwNzcsImV4cCI6MjA3NjgxNzA3N30.ypK3G_37YUY4r-9d4PW2yySZyiU9WkmcFwi_0L4JnIk"), {
        cookies: {
            get (name) {
                return req.cookies.get(name)?.value;
            },
            set (name, value, options) {
                try {
                    res.cookies.set({
                        name,
                        value,
                        ...options
                    });
                } catch  {
                // En entornos Edge, puede no ser compatible, por eso hacemos un fallback
                }
            },
            remove (name, options) {
                try {
                    res.cookies.set({
                        name,
                        value: "",
                        ...options
                    });
                } catch  {}
            }
        }
    });
}
}),
"[project]/proyectos/nopain/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$proyectos$2f$nopain$2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/proyectos/nopain/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$proyectos$2f$nopain$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/proyectos/nopain/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$proyectos$2f$nopain$2f$utils$2f$supabase$2f$middleware$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/proyectos/nopain/utils/supabase/middleware.ts [middleware-edge] (ecmascript)");
;
;
async function middleware(req) {
    const res = __TURBOPACK__imported__module__$5b$project$5d2f$proyectos$2f$nopain$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$proyectos$2f$nopain$2f$utils$2f$supabase$2f$middleware$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["createClient"])(req, res);
    // Obtener usuario actual
    const { data: { user } } = await supabase.auth.getUser();
    const pathname = req.nextUrl.pathname;
    // ✅ Rutas protegidas (solo con sesión)
    const protectedRoutes = [
        "/clinics",
        "/clinic-panel"
    ];
    // Si no hay sesión y quiere acceder a una ruta protegida → redirigir a login
    if (!user && protectedRoutes.some((path)=>pathname.startsWith(path))) {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = "/login";
        return __TURBOPACK__imported__module__$5b$project$5d2f$proyectos$2f$nopain$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(redirectUrl);
    }
    // Si hay sesión, obtener rol del usuario
    if (user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
        const role = profile?.role || "paciente";
        // 🚫 Bloquear acceso de pacientes al panel de clínicas
        if (pathname.startsWith("/clinic-panel") && role !== "clinica") {
            const redirectUrl = req.nextUrl.clone();
            redirectUrl.pathname = "/clinics";
            return __TURBOPACK__imported__module__$5b$project$5d2f$proyectos$2f$nopain$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(redirectUrl);
        }
    // 🚫 (Opcional) Bloquear acceso de clínicas al área pública si lo prefieres
    // if (pathname.startsWith("/clinics") && role === "clinica") {
    //   const redirectUrl = req.nextUrl.clone()
    //   redirectUrl.pathname = "/clinic-panel"
    //   return NextResponse.redirect(redirectUrl)
    // }
    }
    return res;
}
const config = {
    matcher: [
        "/clinics/:path*",
        "/clinic-panel/:path*"
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__2da03faf._.js.map