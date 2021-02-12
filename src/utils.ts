const logging = function(message: string, payload: any = null) {
  let date = new Date()

  console.log(`[${date.toISOString()}] ${message}`)

  if (payload) {
    if (typeof payload === 'string' || payload instanceof String) {
      console.log(`[${date.toISOString()}] ${payload}`)
    } else {
      console.log(`[${date.toISOString()}] ${JSON.stringify(payload)}`)
    }
  }
}

export { logging }
