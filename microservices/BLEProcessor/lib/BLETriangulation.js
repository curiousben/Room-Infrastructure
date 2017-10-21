'use strict'



let parsePayload = (payload) => {
  return new Promise{
    resolve => {
      payload.uuid.toString('hex').slice(8,-12)
    }
  )
}
