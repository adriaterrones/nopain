(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__f2b15f93._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
(()=>{
    const e = new Error("Cannot find module '@/utils/supabase/middleware'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
;
;
async function middleware(req) {
    const res = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    const supabase = createClient(req, res);
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
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(redirectUrl);
    }
    // Si hay sesión, obtener rol del usuario
    if (user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
        const role = profile?.role || "paciente";
        // 🚫 Bloquear acceso de pacientes al panel de clínicas
        if (pathname.startsWith("/clinic-panel") && role !== "clinica") {
            const redirectUrl = req.nextUrl.clone();
            redirectUrl.pathname = "/clinics";
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(redirectUrl);
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

//# sourceMappingURL=%5Broot-of-the-server%5D__f2b15f93._.js.map