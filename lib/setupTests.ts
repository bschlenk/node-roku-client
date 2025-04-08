import { vi } from 'vitest'
import createFetchMock from 'vitest-fetch-mock'

type Headers = Record<string, string>

vi.mock('node-ssdp', async () => {
  const ssdp = await vi.importActual('node-ssdp')

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

      if (Array.isArray(headers)) {
        let index = 0
        const { length } = headers
        setTimeout(function recurseResponses() {
          callResponse(index)
          index += 1
          if (index < length) {
            setTimeout(recurseResponses, 0)
          }
        }, 0)
      } else {
        setTimeout(callResponse, 0)
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

  return { ...ssdp, Client, __setHeaders }
})

const fetchMocker = createFetchMock(vi)

fetchMocker.enableMocks()
