export function errorResponse(message: string, status: number = 400) {
  return new Response(JSON.stringify({ message }), { status })
}