import xml2js from 'isomorphic-xml2js';

export function parseXml(xml: string): Promise<any> {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
}
