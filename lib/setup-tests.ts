import { vi } from 'vitest'
import createFetchMock from 'vitest-fetch-mock'

type Headers = Record<string, string>

vi.mock('node-ssdp', () => {
  let headers: Headers | Headers[] | null = null

  class Client {
    searched: string | null = null
    events: Record<string, (headers: Headers) => void> = {}

    /**
     * Mock .search()
     * @param {string} query 'ssdp:all'
     */
    search(query: string) {
      this.searched = query
      if (!headers) return

      const callResponse = (index: number | null = null) => {
        const { response } = this.events
        if (response) {
          if (index === null) {
            response(headers as Record<string, string>)
          } else {
            response((headers as Record<string, string>[])[index])
          }
        }
      }

      // For single response, call immediately
      // For array responses, schedule them at increasing intervals to simulate staggered arrivals
      if (Array.isArray(headers)) {
        headers.forEach((_, index) => {
          // Schedule each response with a small delay (10ms apart)
          // This allows tests to control when responses fire using fake timers
          setTimeout(() => callResponse(index), index * 10)
        })
      } else {
        callResponse()
      }
    }

    /**
     * Mock .on() event listener method
     * @param {string}   eventName 'response'
     * @param {function} callback pass data back to callee
     * @return {{ SERVER: string, LOCATION: string }}
     */
    on(event: string, fn: (headers: Record<string, string>) => void) {
      this.events[event] = fn
    }

    stop() {
      // no-op
    }
  }

  function __setHeaders(h: Headers | Headers[] | null) {
    headers = h
  }

  return {
    default: { Client },
    Client,
    __setHeaders,
  }
})

const fetchMocker = createFetchMock(vi)

fetchMocker.enableMocks()
