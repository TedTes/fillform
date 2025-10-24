/**
 * Root page - redirects to landing
 */

import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/landing')
}