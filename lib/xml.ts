import { Parser } from 'xml2js'
import { parseBooleans } from 'xml2js/lib/processors.js'

import { camelcase } from './utils.js'

const parser = new Parser({
  explicitArray: false,
  tagNameProcessors: [camelcase],
  attrNameProcessors: [camelcase],
  attrValueProcessors: [parseBooleans],
  valueProcessors: [parseBooleans],
})

export function parseXml(xml: string): any {
  return parser.parseStringPromise(xml)
}
