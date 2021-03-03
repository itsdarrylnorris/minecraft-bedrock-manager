import shell, { ShellString } from 'shelljs'

// Logging
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

// Executing Shell Script
const executeShellScript = function(string: string): ShellString | undefined {
  logging(`Executing this shell command: ${string}`)
  let results: ShellString | undefined

  if (process.env.ENVIRONMENT !== 'DEVELOPMENT') {
    results = shell.exec(string, { silent: true })
  }
  logging('Execution output', results)

  return results
}

export { logging, executeShellScript }
