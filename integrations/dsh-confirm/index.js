import { lstat, mkdir, readFile, realpath } from 'node:fs/promises'
import { request } from 'node:http'
import { homedir } from 'node:os'
import { join } from 'node:path'

export const name = 'ppt-master-confirm'
export const inject = ['webServer']

const route = '/ppt-master-confirm'
const codePattern = /^[a-f0-9]{24}$/u
const readPath = /^(?:\/|\/api\/(?:session|catalogs|icon-previews|ai-image-comparison|recommendations)|\/(?:static|ai-image-comparison)\/[\w./%-]+)$/u
const writePaths = new Set(['/api/confirm', '/api/shutdown'])
const headers = {
  'cache-control': 'no-store',
  'referrer-policy': 'no-referrer',
  'x-content-type-options': 'nosniff',
  'content-security-policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'self'; base-uri 'none'; object-src 'none'; form-action 'self'",
}

function reply(response, status, text) {
  response.writeHead(status, { ...headers, 'content-type': 'text/plain; charset=utf-8' })
  response.end(text)
}

function sameOrigin(request) {
  try {
    const origin = new URL(request.headers.origin)
    return ['http:', 'https:'].includes(origin.protocol)
      && origin.host === request.headers.host
      && !['cross-site', 'same-site'].includes(request.headers['sec-fetch-site'])
  } catch {
    return false
  }
}

export async function apply(ctx) {
  const home = await realpath(process.env.DSH_HOME || join(homedir(), '.dsh'))
  const directory = join(home, 'ppt-master-confirm')
  await mkdir(directory, { mode: 0o700, recursive: true })
  const directoryInfo = await lstat(directory)
  if (!directoryInfo.isDirectory() || directoryInfo.uid !== process.getuid?.() || (directoryInfo.mode & 0o077) !== 0) {
    throw new Error('The PPT Master confirmation socket directory must be private to the DSH user.')
  }
  const entry = await readFile(new URL('./entry.html', import.meta.url))
  ctx.effect(() => ctx.webServer.register({
    kind: 'prefix',
    path: route,
    async handler(incoming, response) {
      const url = new URL(incoming.url, 'http://localhost')
      const path = url.pathname.slice(route.length)
      if (incoming.method === 'GET' && (path === '' || path === '/')) {
        const code = url.searchParams.get('code')?.trim().toLowerCase()
        if (code !== undefined && !codePattern.test(code)) return reply(response, 400, 'Invalid confirmation code.')
        if (path === '' || code !== undefined) {
          const base = path === '' ? './ppt-master-confirm/' : './'
          response.writeHead(303, { ...headers, location: base + (code ? code + '/' : '') })
          return response.end()
        }
        response.writeHead(200, { ...headers, 'content-type': 'text/html; charset=utf-8' })
        return response.end(entry)
      }
      const [, code, target] = /^\/([a-f0-9]{24})(\/.*)$/u.exec(path) ?? []
      const writing = incoming.method === 'POST'
      const reading = incoming.method === 'GET' || incoming.method === 'HEAD'
      if (!code || !((reading && readPath.test(target)) || (writing && writePaths.has(target)))) {
        return reply(response, 404, 'Confirmation page not found.')
      }
      if (writing) {
        if (!sameOrigin(incoming)) return reply(response, 403, 'Cross-origin confirmation rejected.')
        const length = Number(incoming.headers['content-length'])
        if (!Number.isSafeInteger(length) || length < 1 || length > 1024 * 1024) return reply(response, 413, 'Invalid confirmation size.')
      }

      const socketPath = join(directory, code + '.sock')
      const socket = await lstat(socketPath).catch(() => undefined)
      if (!socket?.isSocket() || socket.uid !== directoryInfo.uid) return reply(response, 404, 'Confirmation expired or not found.')

      const upstream = request({
        socketPath,
        path: target + url.search,
        method: incoming.method,
        headers: {
          host: '127.0.0.1',
          ...(writing ? {
            'content-type': 'application/json',
            'content-length': incoming.headers['content-length'],
          } : {}),
        },
        timeout: 30_000,
      }, result => {
        response.writeHead(result.statusCode, {
          ...headers,
          'content-type': result.headers['content-type'] ?? 'application/octet-stream',
        })
        result.on('error', () => response.destroy())
        result.pipe(response)
      })
      upstream.on('timeout', () => upstream.destroy())
      upstream.on('error', () => {
        if (!response.headersSent) reply(response, 502, 'Confirmation service is unavailable.')
        else response.destroy()
      })
      response.on('close', () => upstream.destroy())
      incoming.pipe(upstream)
    },
  }), 'PPT Master confirmation page')
}
