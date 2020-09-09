const HttpStatus = require('http-status-codes')
const jsonwebtoken = require('jsonwebtoken');

const pem = '-----BEGIN CERTIFICATE-----\n' +
    'MIIDATCCAemgAwIBAgIJSrAO+NkiKlhQMA0GCSqGSIb3DQEBCwUAMB4xHDAaBgNV\n' +
    'BAMTE2NvY29yYS51cy5hdXRoMC5jb20wHhcNMjAwOTA2MjA1MjM4WhcNMzQwNTE2\n' +
    'MjA1MjM4WjAeMRwwGgYDVQQDExNjb2NvcmEudXMuYXV0aDAuY29tMIIBIjANBgkq\n' +
    'hkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyAvnEI0mQ856RftQaS7K7LDpO30AVfmt\n' +
    'Nr0F1tTvVtBm8TVCDsu0OGisdKWVutEp2cYlm62DgNUx93f/oekUtSGhNZPZ5RbB\n' +
    '9E447Dxf/jzu25UC+o3AoiiXvnwwvy2ZabRjpFWSU+KaMzQ7qPOOpJDkw1LplTug\n' +
    '22zo6H6rKf9VrrK/sP5t5QEwhrFPlQvWvShn5FHNX9SVpGVTT+SVMSOFNzHNgwht\n' +
    'YYaKn9OAyqHf+haPMTThjEehAMHqMqoJOt31uUgUSIM5LmE37omkZJpC1H16iQZl\n' +
    'SdzLfgUvnRio4+wFRsqNy4NLc/61CQ8ggFVeIedalGgvcZ34BTa+0wIDAQABo0Iw\n' +
    'QDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBTkwAr0LJxaE0FlgYfBNc8nYJRQ\n' +
    'lzAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAJJ4PuhPMuOG11Ty\n' +
    'nu/ainLnOLnvZV+1WCHTxWIg2YQDjOxdvqxTGQa/IPMmLTQE8HTln80jI+H0hnZ+\n' +
    'lbNzk/pPB/s8069Pg/8s3MvYFy86C2T4R55UTyADXRVlKNVCNUb5pxvuTIK7pr8z\n' +
    'gRdk8+Iu19si9Gcs0cC9fmBzyM2qp7Ph6wN1iymjCMMkbGDJFwyEbgmSK2aa1hdL\n' +
    '52PWgcuZSy7LZkoqvaHBMISQgoP/J5gdZMeXlrXuNuphTfyCxZVp20BokvQO2Xr+\n' +
    'yel14z+pGWxaeKdVEAVxjPUQcfUgAxN11L4YRzLuoqSR4jPy/K7y+XXhaEbgaqop\n' +
    'o1buRyo=\n' +
    '-----END CERTIFICATE-----'

const authenticate = (event, context, callback) => {
  try {
    if(!event.headers.authorization) {
      return callback(null, {
        statusCode: HttpStatus.UNAUTHORIZED,
        body: JSON.stringify({message: 'Authentication required'})
      })
    }
    const token = event.headers.authorization.split(' ')[1];

    return jsonwebtoken.verify(token, pem);
  } catch(e) {
    console.error('Authentication error', e);
    callback(null, {
      statusCode: HttpStatus.UNAUTHORIZED,
      body: JSON.stringify({message: e.message})
    })
    return null;
  }
}
exports.authenticate = authenticate;
