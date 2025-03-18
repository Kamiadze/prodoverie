export async function submitBooking(formData: FormData) {
  const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(Object.fromEntries(formData)),
  })

  if (!response.ok) {
    throw new Error('Failed to submit booking')
  }

  return response.json()
}

export async function submitContactForm(formData: FormData) {
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(Object.fromEntries(formData)),
  })

  if (!response.ok) {
    throw new Error('Failed to submit contact form')
  }

  return response.json()
}

export async function getBookings() {
  const response = await fetch('/api/bookings')

  if (!response.ok) {
    throw new Error('Failed to fetch bookings')
  }

  return response.json()
}

export async function getMessages() {
  const response = await fetch('/api/contact')

  if (!response.ok) {
    throw new Error('Failed to fetch messages')
  }

  return response.json()
} 