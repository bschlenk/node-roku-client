module.exports = function(ip) {
  return {
    ip: _ip
  }

  function _ip () {
    return String(ip)
  }
}