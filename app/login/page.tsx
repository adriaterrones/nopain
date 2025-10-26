export default function LoginPage() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <h1 className="text-4xl font-semibold mb-4 tracking-tight">
        Iniciar sesión
      </h1>
      <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mb-8">
        Accede a tu cuenta de NoPain para gestionar tus citas, ver tus clínicas favoritas
        y reservar sesiones fácilmente.
      </p>

      <button className="bg-primary text-white px-6 py-3 rounded-xl font-semibold text-lg shadow-md hover:shadow-lg hover:bg-blue-700 transition-all">
        Iniciar sesión con correo
      </button>
    </section>
  )
}
