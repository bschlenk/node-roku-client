import { Parser } from 'xml2js'
import { parseBooleans } from 'xml2js/lib/processors'
import { camelcase } from './utils'

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
