import { ReservationService } from '@/services/reservationService'
import ReservationsClient from './ReservationsClient'

export default async function ReservationsPage() {
  const reservations = await ReservationService.getAllReservations()

  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-black text-white uppercase mb-8">
        📋 Reservations
      </h1>
      <ReservationsClient reservations={reservations} />
    </main>
  )
}