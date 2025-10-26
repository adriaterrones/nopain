export default function DashboardPage() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <h1 className="text-4xl font-semibold mb-4 tracking-tight">
        Panel de usuario
      </h1>
      <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl">
        Bienvenido a tu espacio personal. Aquí podrás gestionar tus reservas, revisar tu historial
        de sesiones y actualizar tus datos de perfil.
      </p>
    </section>
  )
}
