import Link from "next/link"

export default function HomePage() {
  return (
    <main className="flex flex-col items-center text-center min-h-[90vh]">
      {/* HERO */}
      <section className="flex flex-col items-center justify-center flex-1 px-6 py-20">
        <h1 className="text-6xl font-extrabold leading-tight mb-6 text-gray-900 dark:text-gray-100">
          Recupera tu bienestar con{" "}
          <span className="text-primary">NoPain</span>
        </h1>

        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mb-10">
          Encuentra clínicas de fisioterapia de confianza, reserva tus sesiones
          en segundos y vuelve a moverte sin dolor. Tu recuperación empieza aquí.
        </p>

        <Link
          href="/clinics"
          className="relative inline-flex items-center justify-center px-10 py-4 text-lg font-semibold rounded-xl text-white bg-primary hover:bg-blue-700 shadow-md hover:shadow-xl transition-all duration-300"
        >
          Explorar clínicas
        </Link>

        <div className="mt-16 flex justify-center">
          <img
            src="https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=1000&q=80"
            alt="Fisioterapia"
            className="rounded-3xl shadow-lg w-full max-w-3xl object-cover"
          />
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-white dark:bg-gray-800 w-full py-20 mt-10 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-4xl font-bold mb-12 text-gray-900 dark:text-gray-100">
          ¿Por qué elegir NoPain?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto px-6">
          <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-md transition">
            <h3 className="text-2xl font-semibold mb-3 text-primary">
              🔍 Encuentra tu clínica ideal
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Filtra por ubicación, especialidad o valoración y descubre los mejores centros de fisioterapia cerca de ti.
            </p>
          </div>

          <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-md transition">
            <h3 className="text-2xl font-semibold mb-3 text-primary">
              📅 Reserva en segundos
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Olvídate de llamadas y esperas. Gestiona tus sesiones online de forma rápida y sencilla.
            </p>
          </div>

          <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-md transition">
            <h3 className="text-2xl font-semibold mb-3 text-primary">
              💪 Profesionales de confianza
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Clínicas verificadas con fisioterapeutas colegiados y valoraciones reales de pacientes.
            </p>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="w-full py-24 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <h2 className="text-4xl font-bold mb-12 text-gray-900 dark:text-gray-100">
          Cómo funciona NoPain
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto px-6 text-left md:text-center">
          <div className="flex flex-col items-center">
            <div className="bg-primary text-white text-3xl font-bold w-14 h-14 rounded-full flex items-center justify-center mb-4 shadow-md">
              1
            </div>
            <h3 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Busca tu clínica
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Encuentra la clínica perfecta según tu ubicación o especialidad de fisioterapia.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="bg-primary text-white text-3xl font-bold w-14 h-14 rounded-full flex items-center justify-center mb-4 shadow-md">
              2
            </div>
            <h3 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Reserva tu sesión
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Selecciona el día y la hora que mejor te venga y confirma tu cita en segundos.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="bg-primary text-white text-3xl font-bold w-14 h-14 rounded-full flex items-center justify-center mb-4 shadow-md">
              3
            </div>
            <h3 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Recupera sin dolor
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Acude a tu cita, sigue el plan personalizado y vuelve a moverte sin molestias.
            </p>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="w-full py-24 bg-primary text-white mt-10">
        <h2 className="text-4xl font-bold mb-4">
          Tu recuperación empieza hoy
        </h2>
        <p className="text-lg mb-8">
          Encuentra tu clínica y reserva tu primera sesión con un clic.
        </p>
        <Link
          href="/clinics"
          className="bg-white text-primary px-8 py-3 rounded-xl text-lg font-semibold shadow-md hover:shadow-lg hover:bg-gray-100 transition-all"
        >
          Explorar clínicas
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="w-full bg-gray-100 dark:bg-gray-950 text-gray-700 dark:text-gray-300 py-12 mt-16 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="text-left">
            <h3 className="text-2xl font-bold text-primary mb-3">NoPain</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tu plataforma de confianza para reservar sesiones de fisioterapia de forma rápida, segura y profesional.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-3">Enlaces útiles</h4>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/clinics" className="hover:text-primary">Clínicas</Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-primary">Iniciar sesión</Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-primary">Panel de usuario</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-3">Síguenos</h4>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li><a href="#" className="hover:text-primary">Instagram</a></li>
              <li><a href="#" className="hover:text-primary">Twitter</a></li>
              <li><a href="#" className="hover:text-primary">LinkedIn</a></li>
            </ul>
          </div>
        </div>

        <div className="text-center mt-10 text-sm text-gray-500 dark:text-gray-500">
          © {new Date().getFullYear()} NoPain — Todos los derechos reservados.
        </div>
      </footer>
    </main>
  )
}
